import db from "external/mongo/db";
import { CreateGameSettings } from "lib/game-settings/create-game-settings";
import CreateLogCtx from "lib/logger/logger";
import { EmitWebhookEvent } from "lib/webhooks/webhooks";
import { GetGPTConfig, GetGPTString } from "tachi-common";
import type { Game, GPTString, integer, Playtype, UserGameStats, Classes } from "tachi-common";

const logger = CreateLogCtx(__filename);

/**
 * Returns the provided class if it is greater than the one in userGameStats
 * @returns The provided class if it is greater, NULL if there is nothing
 * to compare to, and FALSE if it is worse or equal.
 */
export function ReturnClassIfGreater(
	gptString: GPTString,
	classSet: Classes[GPTString],
	classVal: string,
	userGameStats?: UserGameStats | null
): boolean | null {
	const gptConfig = GetGPTConfig(gptString);

	const classInfo = gptConfig.classes[classSet];

	if (!classInfo) {
		logger.warn(
			`Invalid ReturnClassIfGreater call. Attempted to index set '${classSet}' on ${gptString}. No such class is defined for this game.`
		);

		return null;
	}

	if (!userGameStats) {
		return null;
	}

	const prevClass: string | null | undefined = userGameStats.classes[classSet];

	if (prevClass === null || prevClass === undefined) {
		return null;
	}

	const previousClassIndex = ClassToIndex(gptString, classSet, prevClass);
	const newClassIndex = ClassToIndex(gptString, classSet, classVal);

	if (previousClassIndex === null && newClassIndex === null) {
		return null;
	} else if (newClassIndex === null) {
		return null;
	} else if (previousClassIndex === null) {
		return true;
	}

	return newClassIndex > previousClassIndex;
}

export function ClassToIndex(gptString: GPTString, classSet: Classes[GPTString], classVal: string) {
	const gptConfig = GetGPTConfig(gptString);

	const classInfo = gptConfig.classes[classSet];

	if (!classInfo) {
		logger.warn(
			`Invalid ClassToIndex call. Attempted to index set '${classSet}' on ${gptString}. No such class is defined for this game. Returning null.`
		);
		return null;
	}

	const v = classInfo.values.map((e) => e.id).indexOf(classVal);

	if (v === -1) {
		logger.warn(
			`Attempted to index a class that doesn't exist: ${classVal} on ${classSet} (${gptString}). Returning null.`
		);
		return null;
	}

	return v;
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
	playtype: Playtype,
	classSet: Classes[GPTString],
	classVal: string
) {
	const gptString = GetGPTString(game, playtype);

	const userGameStats = await db["game-stats"].findOne({ userID, game, playtype });
	const isGreater = ReturnClassIfGreater(gptString, classSet, classVal, userGameStats);

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

	await db["class-achievements"].insert({
		game,
		playtype,
		userID,
		classOldValue: isGreater === null ? null : userGameStats!.classes[classSet]!,
		classSet,
		classValue: classVal,
		timeAchieved: Date.now(),
	});

	if (isGreater === null) {
		void EmitWebhookEvent({
			type: "class-update/v1",
			content: { userID, new: classVal, old: null, set: classSet, game, playtype },
		});

		return null;
	}

	void EmitWebhookEvent({
		type: "class-update/v1",
		content: {
			userID,
			new: classVal,
			old: userGameStats!.classes[classSet]!,
			set: classSet,
			game,
			playtype,
		},
	});

	return true;
}
