/* eslint-disable @typescript-eslint/no-explicit-any */

import {
	PrivateUserDocument,
	ScoreDocument,
	GetGameConfig,
	GetGamePTConfig,
	StaticConfig,
} from "tachi-common";
import db from "external/mongo/db";
import MigrateRecords from "../migrate";
import { CreateScoreID } from "lib/score-import/framework/score-importing/score-id";
import CreateLogCtx from "lib/logger/logger";
import { oldKTDB } from "../old-db";

const logger = CreateLogCtx(__filename);

function ConditionalAssign(base: any, baseProp: string, other: any, otherProp: string) {
	if (Object.prototype.hasOwnProperty.call(other, otherProp)) {
		base[baseProp] = other[otherProp];
	}
}

async function ConvertFn(c: any): Promise<ScoreDocument | null> {
	if (!StaticConfig.allSupportedGames.includes(c.game)) {
		logger.warn(`Ignored game ${c.game}`);
		return null;
	}
	const game = c.game;
	const playtype = c.scoreData.playtype;

	const oldChartDoc = await oldKTDB.get("charts-bms").findOne({
		chartID: c.chartID,
	});

	if (!oldChartDoc) {
		logger.warn(`Cannot find oldChartDoc for ${c.chartID}`);
	}

	// @ts-expect-error implicit any is expected
	const chartDoc = await db.charts[game].findOne({
		"data.hashMD5": oldChartDoc.internals.hash,
	});

	if (!chartDoc) {
		const oldSong = await oldKTDB.get("songs-bms").findOne({ id: c.songID });
		logger.warn(`Cannot find ChartDoc for ${oldSong.title} ${oldChartDoc.level} ${playtype}`);
		return null;
		throw new Error(`Cannot find ChartDoc for ${c.scoreID} (${c.chartID})`);
	}

	const gptConfig = GetGamePTConfig(game, chartDoc.playtype);

	if (!gptConfig) {
		logger.error(`Cannot find GPTConfig for ${game} ${chartDoc.playtype}?`);

		throw new Error(`Screwed`);
	}

	const base: Omit<ScoreDocument, "scoreID"> = {
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
			hitMeta: c.scoreData.hitMeta,
		},
		scoreMeta: {
			random: c.scoreMeta?.optionsRandom ?? null,
			inputDevice: c.scoreMeta?.inputDevice ?? null,
		},
	};

	// @ts-expect-error shut
	if (base.scoreData.hitMeta.bp === -1 || Number.isNaN(base.scoreData.hitMeta.bp)) {
		// @ts-expect-error shut
		base.scoreData.hitMeta.bp = null;
	}

	// @ts-expect-error shut
	if (base.scoreData.hitMeta.gauge === -1) {
		// @ts-expect-error shut
		base.scoreData.hitMeta.gauge = null;
	}

	// @ts-expect-error shut
	delete base.scoreData.hitMeta.inputDevice;

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

export async function MigrateBMSScores() {
	await MigrateRecords(db.scores, "scores", ConvertFn, { game: "bms" }, true);
}

if (require.main === module) {
	(async () => {
		await MigrateBMSScores();
		process.exit(0);
	})();
}
