import db from "../../external/mongo/db";
import { integer, Game, Playtypes, UGPTStatDetails } from "tachi-common";
import CreateLogCtx from "../logger/logger";
import { EvaluateUGPTStat } from "./evaluator";
import { GetRelatedStatDocuments } from "./get-related";

const logger = CreateLogCtx(__filename);

/**
 * Evaluate a users set GPT Stats.
 * @param projectUserStats - Optionally, provide another users ID here. Their set stats will be
 * used instead.
 */
export async function EvaluateUsersGPTStats(
	userID: integer,
	game: Game,
	playtype: Playtypes[Game],
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
			`User ${getSettingsID} has no game-settings, yet a call to EvalulateUsersGPTStats was made.`
		);

		throw new Error(
			`User ${getSettingsID} has no game-settings, yet a call to EvalulateUsersGPTStats was made.`
		);
	}

	const results = await Promise.all(
		settings.preferences.stats.map((details) => EvaluateStats(details, userID, game))
	);

	return results;
}

async function EvaluateStats(details: UGPTStatDetails, userID: integer, game: Game) {
	const [result, related] = await Promise.all([
		EvaluateUGPTStat(details, userID),
		GetRelatedStatDocuments(details, game),
	]);

	return { stat: details, value: result, related };
}
