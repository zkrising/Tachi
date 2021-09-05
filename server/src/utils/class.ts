import { Game, integer, IDStrings, Playtypes, UserGameStats } from "tachi-common";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { GameClassSets } from "tachi-common/js/game-classes";
import { CreateGameSettings } from "lib/game-settings/create-game-settings";
import { EmitWebhookEvent } from "lib/webhooks/webhooks";

const logger = CreateLogCtx(__filename);

/**
 * Returns the provided class if it is greater than the one in userGameStats
 * @returns The provided class if it is greater, NULL if there is nothing
 * to compare to, and FALSE if it is worse or equal.
 */
export function ReturnClassIfGreater(
	classSet: GameClassSets[IDStrings],
	classVal: integer,
	userGameStats?: UserGameStats | null
) {
	if (!userGameStats || userGameStats.classes[classSet] === undefined) {
		return null;
	}

	return classVal > userGameStats.classes[classSet]!;
}

/**
 * Updates a user's class value if it is greater than the one in their
 * UserGameStats.
 * @returns False if nothing was updated.
 * Null if it was updated because there was nothing in UserGameStats to
 * compare to.
 * True if it was updated because it was better than UserGameStats.
 */
export async function UpdateClassIfGreater(
	userID: integer,
	game: Game,
	playtype: Playtypes[Game],
	classSet: GameClassSets[IDStrings],
	classVal: integer
) {
	const userGameStats = await db["game-stats"].findOne({ userID, game, playtype });
	const isGreater = ReturnClassIfGreater(classSet, classVal, userGameStats);

	if (isGreater === false) {
		return false;
	}

	if (userGameStats) {
		await db["game-stats"].update(
			{ userID, game, playtype },
			{ $set: { [`classes.${classSet}`]: classVal } }
		);
	} else {
		// insert new game stats for this user - this is an awkward place
		// to call this - maybe we should call it elsewhere.
		await db["game-stats"].insert({
			userID,
			game,
			playtype,
			ratings: {},
			classes: {
				[classSet]: classVal,
			},
		});

		logger.info(`Created new player gamestats for ${userID} (${game} ${playtype})`);

		await CreateGameSettings(userID, game, playtype);
	}

	if (isGreater === null) {
		EmitWebhookEvent({
			type: "class-update/v1",
			content: { userID, new: classVal, old: null, set: classSet },
		});

		return null;
	} else {
		EmitWebhookEvent({
			type: "class-update/v1",
			content: {
				userID,
				new: classVal,
				old: userGameStats!.classes[classSet]!,
				set: classSet,
			},
		});

		return true;
	}
}
