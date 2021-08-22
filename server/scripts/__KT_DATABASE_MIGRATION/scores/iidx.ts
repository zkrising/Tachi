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

	if (c.songID === 1819) {
		c.songID = 1121; // praludium has two songs in kt1 for some reason (tricoro 6)
		// this overrides that
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
		throw new Error(`Cannot find ChartDoc for ${c.scoreID} (${c.chartID})`);
	}

	const base: Omit<ScoreDocument, "scoreID"> = {
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
		scoreMeta: {
			random: c.scoreMeta?.optionsRandom ?? null,
			gauge: c.scoreMeta?.optionsGauge ?? null,
			assist: c.scoreMeta?.optionsAssist ?? null,
			range: c.scoreMeta?.optionsRange ?? null,
		},
	};

	if (c.scoreMeta) {
		// @ts-expect-error this game is iidx
		if (base.playtype === "DP" && !Array.isArray(base.scoreMeta.random)) {
			// @ts-expect-error this game is iidx
			base.scoreMeta.random = null;
		}

		// @ts-expect-error asdf
		if (base.scoreMeta.range === "") {
			// @ts-expect-error asdf
			base.scoreMeta.range = "NONE";
		}
	}

	// @ts-expect-error shut
	if (base.scoreData.hitMeta.bp === -1 || Number.isNaN(base.scoreData.hitMeta.bp)) {
		// @ts-expect-error shut
		base.scoreData.hitMeta.bp = null;
	}

	// @ts-expect-error nope
	if (base.scoreData.hitMeta.gauge > 200) {
		// @ts-expect-error nope
		base.scoreData.hitMeta.gauge = null;
	}

	// @ts-expect-error nope
	if (base.scoreData.hitMeta.gaugeHistory) {
		// @ts-expect-error nope
		base.scoreData.hitMeta.gaugeHistory = base.scoreData.hitMeta.gaugeHistory.map((e) =>
			e > 200 ? null : e
		);
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

	await oldKTDB.get("score-id-lookup").insert({
		old: c.scoreID,
		new: scoreID,
	});

	return score;
}

export async function MigrateIIDXScores() {
	await MigrateRecords(db.scores, "scores", ConvertFn, { game: "iidx" });
}

if (require.main === module) {
	(async () => {
		await MigrateIIDXScores();
		process.exit(0);
	})();
}
