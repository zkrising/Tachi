/* eslint-disable @typescript-eslint/no-explicit-any */

import { ScoreDocument, GetGamePTConfig, StaticConfig } from "tachi-common";
import db from "external/mongo/db";
import MigrateRecords from "../migrate";
import { CreateScoreID } from "lib/score-import/framework/score-importing/score-id";
import CreateLogCtx from "lib/logger/logger";
import { oldKTDB } from "../old-db";

const logger = CreateLogCtx(__filename);

async function ConvertFn(c: any): Promise<ScoreDocument | null> {
	if (!StaticConfig.allSupportedGames.includes(c.game)) {
		logger.warn(`Ignored game ${c.game}`);
		return null;
	}
	const game = c.game;

	// @ts-expect-error implicit any is expected
	const chartDoc = await db.charts[game].findOne({
		chartID: c.chartID,
	});

	if (!chartDoc) {
		logger.warn(`Cannot find ChartDoc for ${c.songID} ${c.chartID} ${c.scoreData.difficulty}`);
		return null;
	}

	const gptConfig = GetGamePTConfig(game, chartDoc.playtype);

	if (!gptConfig) {
		logger.error(`Cannot find GPTConfig for ${game} ${chartDoc.playtype}?`);

		throw new Error(`Screwed`);
	}

	const base: Omit<ScoreDocument<"sdvx:Single">, "scoreID"> = {
		userID: c.userID,
		songID: chartDoc.songID,
		playtype: chartDoc.playtype,
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
			hitMeta: {
				fast: c.scoreData.hitMeta.fast,
				slow: c.scoreData.hitMeta.slow,
				maxCombo: c.scoreData.hitMeta.maxCombo,
				gauge: c.scoreData.hitMeta.gauge,
			},
		},
		scoreMeta: {
			inSkillAnalyser: null,
		},
	};

	if (c.scoreData.hitData.error !== undefined) {
		base.scoreData.judgements.miss = c.scoreData.hitData.error;
		// @ts-expect-error yeah we know
		delete base.scoreData.judgements.error;
	}

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

	try {
		await oldKTDB.get("score-id-lookup").insert({
			old: c.scoreID,
			new: scoreID,
		});
	} catch (err) {
		// lol
	}

	return score;
}

export async function MigrateSDVXScores() {
	await MigrateRecords(db.scores, "scores", ConvertFn, { game: "sdvx" }, true);
}

if (require.main === module) {
	(async () => {
		await MigrateSDVXScores();
		process.exit(0);
	})();
}
