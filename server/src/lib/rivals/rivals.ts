import db from "external/mongo/db";
import { SetRivalsFailReasons } from "lib/constants/err-codes";
import CreateLogCtx from "lib/logger/logger";
import { SendSetRivalNotification } from "lib/notifications/notification-wrappers";
import { FormatGame } from "tachi-common";
import { ArrayDiff } from "utils/misc";
import { GetUsersWithIDs, GetUserWithIDGuaranteed } from "utils/user";
import type { Game, integer, Playtype } from "tachi-common";

const logger = CreateLogCtx(__filename);

/**
 * Retrieve all of a user's set rival IDs.
 * Throws if the user hasn't played the GPT in question.
 */
export async function GetRivalIDs(userID: integer, game: Game, playtype: Playtype) {
	const gameSettings = await db["game-settings"].findOne(
		{
			userID,
			game,
			playtype,
		},
		{
			projection: {
				rivals: 1,
			},
		}
	);

	if (!gameSettings) {
		throw new Error(
			`User ${userID} has not played ${FormatGame(game, playtype)}. Cannot retrieve rivals.`
		);
	}

	return gameSettings.rivals;
}

/**
 * Get the user documents of the rivals for this UGPT.
 * Throws if the user hasn't played the GPT in question.
 */
export async function GetRivalUsers(userID: integer, game: Game, playtype: Playtype) {
	const rivalIDs = await GetRivalIDs(userID, game, playtype);

	const rivals = await GetUsersWithIDs(rivalIDs);

	return rivals;
}

/**
 * Sets an array of userIDs to be this user's rivals. Performs validation on all of the
 * rivals being players of the game, and not being duplicates. The maximum amount of rivals
 * a player can have is 5.
 */
export async function SetRivals(
	userID: integer,
	game: Game,
	playtype: Playtype,
	newRivals: Array<integer>
) {
	if (newRivals.length > 5) {
		return SetRivalsFailReasons.TOO_MANY;
	}

	if (newRivals.some((e) => e === userID)) {
		return SetRivalsFailReasons.RIVALED_SELF;
	}

	const playedGPTCount = await db["game-settings"].count({
		userID: { $in: newRivals },
		game,
		playtype,
	});

	// note: this check also checks that nothing provided is a duplicate.
	if (playedGPTCount !== newRivals.length) {
		return SetRivalsFailReasons.RIVALS_HAVENT_PLAYED_GPT;
	}

	const currentGameSettings = await db["game-settings"].findOne({
		userID,
		game,
		playtype,
	});

	if (!currentGameSettings) {
		logger.severe(
			`User ${userID} attempted to set rivals for ${FormatGame(
				game,
				playtype
			)}, but doesn't have game settings. Was their account deleted in midair?`
		);

		throw new Error(
			`User ${userID} attempted to set rivals for ${FormatGame(
				game,
				playtype
			)}, but doesn't have game settings. Was their account deleted in midair?`
		);
	}

	const newSubs = ArrayDiff(currentGameSettings.rivals, newRivals);

	const user = await GetUserWithIDGuaranteed(userID);

	await Promise.all(
		newSubs.map((toUserID) => SendSetRivalNotification(toUserID, user, game, playtype))
	);

	return db["game-settings"].update(
		{
			userID,
			game,
			playtype,
		},
		{
			$set: {
				rivals: newRivals,
			},
		}
	);
}

/**
 * Add a single new rival by their userID.
 */
export async function AddRival(userID: integer, game: Game, playtype: Playtype, newRival: integer) {
	const rivalIDs = await GetRivalIDs(userID, game, playtype);

	rivalIDs.push(newRival);

	// We use set rivals because its race condition safe. We don't have to check > 5
	// or anything.
	return SetRivals(userID, game, playtype, rivalIDs);
}

/**
 * Remove a single rival by their userID.
 *
 * @returns null if this UGPT is not rivals with the user, and therefore there is
 * nothing to change.
 */
export async function RemoveRival(
	userID: integer,
	game: Game,
	playtype: Playtype,
	toRemove: integer
) {
	const rivalIDs = await GetRivalIDs(userID, game, playtype);

	const filteredRivals = rivalIDs.filter((e) => e !== toRemove);

	if (filteredRivals.length === rivalIDs.length) {
		return null;
	}

	return SetRivals(userID, game, playtype, rivalIDs);
}

/**
 * Get all of the userIDs of people who rival the userID for this GPT.
 */
export async function GetChallengerIDs(userID: integer, game: Game, playtype: Playtype) {
	const result = await db["game-settings"].find(
		{
			game,
			playtype,
			rivals: userID,
		},
		{
			projection: {
				userID: 1,
			},
		}
	);

	return result.map((e) => e.userID);
}

/**
 * Get the user documents of everyone who is rivalling this userID for this GPT.
 */
export async function GetChallengerUsers(userID: integer, game: Game, playtype: Playtype) {
	const challengerIDs = await GetChallengerIDs(userID, game, playtype);

	return GetUsersWithIDs(challengerIDs);
}
