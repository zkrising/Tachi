/* eslint-disable @typescript-eslint/no-explicit-any */

import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { CreateScoreID } from "lib/score-import/framework/score-importing/score-id";
import { GetGameConfig, GetGamePTConfig, ScoreDocument } from "tachi-common";
import MigrateRecords from "../migrate";
import { oldKTDB } from "../old-db";

const logger = CreateLogCtx(__filename);

async function ConvertFn(c: any): Promise<ScoreDocument | null> {
	const game = c.game;
	const playtype = c.scoreData.playtype;

	const gameConfig = GetGameConfig(game);

	if (!gameConfig.validPlaytypes.includes(playtype)) {
		logger.warn(`Ignored game pt ${game}, ${playtype}`);
		throw new Error(`Ignored game pt ${game}, ${playtype}`);
	}

	const gptConfig = GetGamePTConfig(game, playtype);

	if (!gptConfig) {
		logger.error(`No gptconfig for ${game} ${playtype}?`);
		throw new Error(`No gptconfig for ${game} ${playtype}?`);
	}

	// @ts-expect-error implicit any is expected
	const chartDoc = await db.charts[game].findOne({
		songID: c.songID,
		difficulty: c.scoreData.difficulty,
		playtype,
	});

	if (!chartDoc) {
		logger.warn(`Cannot find ChartDoc for ${c.songID} ${c.scoreData.difficulty} ${playtype} `);
		return null;
	}

	const base: Omit<ScoreDocument<"chunithm:Single">, "scoreID"> = {
		userID: c.userID,
		songID: chartDoc.songID,
		playtype,
		chartID: chartDoc.chartID,
		game: c.game,
		timeAdded: c.timeAdded,
		timeAchieved: Number.isNaN(c.timeAchieved) ? null : c.timeAchieved,
		comment: c.comment ?? null,
		highlight: c.highlight ?? false,
		service: c.service,
		importType: null,
		// we'll just recalc calculated data instead of trying to update
		calculatedData: {},
		isPrimary: chartDoc.isPrimary,
		scoreData: {
			esd: c.scoreData.esd ?? null,
			grade: c.scoreData.grade,
			gradeIndex: gptConfig.grades.indexOf(c.scoreData.grade),
			lamp: c.scoreData.lamp,
			lampIndex: gptConfig.lamps.indexOf(c.scoreData.lamp),
			percent: c.scoreData.percent,
			score: c.scoreData.score,
			judgements: c.scoreData.hitData,
			hitMeta: c.scoreData.hitMeta,
		},
		scoreMeta: {},
	};

	const scoreID = CreateScoreID(base.userID, base, base.chartID);

	const exists = await db.scores.findOne({ scoreID });

	if (exists) {
		logger.warn(`Skipping duplicate score ${base.chartID} ${base.userID}.`);
		return null;
	}

	const score: ScoreDocument = {
		...base,
		scoreID,
	};

	await oldKTDB.get("score-id-lookup").insert({
		old: c.scoreID,
		new: scoreID,
	});

	return score;
}

export async function MigrateCHUNITHMScores() {
	await MigrateRecords(db.scores, "scores", ConvertFn, { game: "chunithm" }, true);
}
