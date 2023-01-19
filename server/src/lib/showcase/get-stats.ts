import { EvaluateShowcaseStat } from "./evaluator";
import { GetRelatedStatDocuments } from "./get-related";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { GetGPTString } from "tachi-common";
import type { integer, Game, Playtype, ShowcaseStatDetails, GPTString } from "tachi-common";

const logger = CreateLogCtx(__filename);

/**
 * Evaluate a users set Stats Showcase.
 * @param projectUserStats - Optionally, provide another users ID here. Their stats showcase will be
 * used instead.
 */
export async function EvaluateUsersStatsShowcase(
	userID: integer,
	game: Game,
	playtype: Playtype,
	projectUserStats?: integer
) {
	const getSettingsID = projectUserStats ?? userID;
	const settings = await db["game-settings"].findOne({
		userID: getSettingsID,
		game,
		playtype,
	});

	if (!settings) {
		logger.error(
			`User ${getSettingsID} has no game-settings, yet a call to EvaluateUsersStatsShowcase was made.`
		);

		throw new Error(
			`User ${getSettingsID} has no game-settings, yet a call to EvaluateUsersStatsShowcase was made.`
		);
	}

	const gpt = GetGPTString(game, playtype);

	const results = await Promise.all(
		settings.preferences.stats.map((details) => EvaluateStats(gpt, details, userID, game))
	);

	return results;
}

async function EvaluateStats(
	gpt: GPTString,
	details: ShowcaseStatDetails,
	userID: integer,
	game: Game
) {
	const [result, related] = await Promise.all([
		EvaluateShowcaseStat(gpt, details, userID),
		GetRelatedStatDocuments(details, game),
	]);

	return { stat: details, result, related };
}
