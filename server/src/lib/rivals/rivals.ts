import db from "external/mongo/db";
import { SetRivalsFailReasons } from "lib/constants/err-codes";
import CreateLogCtx from "lib/logger/logger";
import { SendSetRivalNotification } from "lib/notifications/notification-wrappers";
import { ServerConfig } from "lib/setup/config";
import { FormatGame, GetGamePTConfig } from "tachi-common";
import { ArrayDiff } from "utils/misc";
import { GetUsersWithIDs, GetUserWithIDGuaranteed } from "utils/user";
import type { BulkWriteUpdateOneOperation } from "mongodb";
import type { Game, integer, PBScoreDocument, Playtype } from "tachi-common";

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
 * Retrieve *all* rival IDs for people on this game. Used to recalculate rival movements on charts,
 * since that is stored and cached.
 */
export async function GetEveryonesRivalIDs(
	game: Game,
	playtype: Playtype
): Promise<Record<number, Array<number>>> {
	const allGameSettings = await db["game-settings"].find(
		{
			game,
			playtype,
		},
		{
			projection: {
				userID: 1,
				rivals: 1,
			},
		}
	);

	const lookupTable: Record<integer, Array<integer>> = {};

	for (const d of allGameSettings) {
		lookupTable[d.userID] = d.rivals;
	}

	return lookupTable;
}

/**
 * Sets an array of userIDs to be this user's rivals. Performs validation on all of the
 * rivals being players of the game, and not being duplicates. The maximum amount of rivals
 * a player can have is ServerConfig.MAX_RIVALS (defaults to 5).
 */
export async function SetRivals(
	userID: integer,
	game: Game,
	playtype: Playtype,
	newRivals: Array<integer>
) {
	if (newRivals.length > ServerConfig.MAX_RIVALS) {
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

	await db["game-settings"].update(
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

	await UpdatePlayersRivalRankings(userID, game, playtype);
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

/**
 * Given a UGPT, update their rival rankings.
 *
 * @warn Horrifically race-condition insensitive. This method for updating rankings
 * on PBs is just absolutely horrifically misguided, and will break.
 *
 * As I said to blake, this is "eventually consistent", in the sense that "eventually"
 * someone will get a score on the chart in question and it will fix itself.
 *
 * this sucks though.
 */
export async function UpdatePlayersRivalRankings(userID: integer, game: Game, playtype: Playtype) {
	const gptConfig = GetGamePTConfig(game, playtype);

	const rivalIDs = await GetRivalIDs(userID, game, playtype);

	// get all of this user's chartIDs so we know what to update
	const userPBs = (await db["personal-bests"].find(
		{ userID, game, playtype },
		{ projection: { chartID: 1, [`scoreData.${gptConfig.defaultMetric}`]: 1 } }
	)) as Array<{ chartID: string; scoreData: { percent: number } }>;

	const bwrite: Array<BulkWriteUpdateOneOperation<PBScoreDocument>> = [];

	await Promise.all(
		userPBs.map(async (pb) => {
			const rivalRank =
				(await db["personal-bests"].count({
					chartID: pb.chartID,
					userID: { $in: rivalIDs },
					[`scoreData.${gptConfig.defaultMetric}`]: { $gt: pb.scoreData.percent },
				})) + 1;

			bwrite.push({
				updateOne: {
					filter: { chartID: pb.chartID, userID },
					update: {
						$set: {
							"rankingData.rivalRank": rivalRank,
						},
					},
				},
			});
		})
	);

	if (bwrite.length === 0) {
		return;
	}

	await db["personal-bests"].bulkWrite(bwrite, { ordered: false });
}
