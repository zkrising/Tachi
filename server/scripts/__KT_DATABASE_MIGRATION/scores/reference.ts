/* eslint-disable @typescript-eslint/no-explicit-any */

import { ScoreDocument, GetGameConfig, GetGamePTConfig, StaticConfig } from "tachi-common";
import db from "external/mongo/db";
import MigrateRecords from "../migrate";
import { CreateScoreID } from "lib/score-import/framework/score-importing/score-id";
import CreateLogCtx from "lib/logger/logger";

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

	if (["popn", "jubeat", "gitadora", "usc"].includes(c.game)) {
		return null;
	}

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

	if (game === "iidx" && c.songID === 1819) {
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
		scoreMeta: {},
	};

	if (c.scoreMeta) {
		if (base.game === "iidx") {
			ConditionalAssign(base.scoreMeta, "random", c.scoreMeta, "optionsRandom");
			ConditionalAssign(base.scoreMeta, "gauge", c.scoreMeta, "optionsGauge");
			ConditionalAssign(base.scoreMeta, "assist", c.scoreMeta, "optionsAssist");
			ConditionalAssign(base.scoreMeta, "range", c.scoreMeta, "optionsRange");
			ConditionalAssign(base.scoreMeta, "pacemaker", c.scoreMeta, "pacemaker");
			ConditionalAssign(base.scoreMeta, "pacemakerName", c.scoreMeta, "pacemakerName");
			ConditionalAssign(base.scoreMeta, "pacemakerTarget", c.scoreMeta, "pacemakerTarget");

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
		} else if (base.game === "bms") {
			ConditionalAssign(base.scoreMeta, "random", c.scoreMeta, "optionsRandom");
			ConditionalAssign(base.scoreMeta, "inputDevice", c.scoreData.hitMeta, "inputDevice");
		}
	}

	// @ts-expect-error shut
	if (base.scoreData.hitMeta.bp === -1 || Number.isNaN(base.scoreData.hitMeta.bp)) {
		// @ts-expect-error shut
		base.scoreData.hitMeta.bp = null;
	}

	if (base.game === "iidx") {
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
	} else if (base.game === "bms") {
		// @ts-expect-error shut
		if (base.scoreData.hitMeta.gauge === -1) {
			// @ts-expect-error shut
			base.scoreData.hitMeta.gauge = null;
		}

		// @ts-expect-error shut
		delete base.scoreData.hitMeta.inputDevice;
	} else if (base.game === "sdvx" || base.game === "usc") {
		ConditionalAssign(base.scoreData.judgements, "miss", base.scoreData.judgements, "error");

		//@ts-expect-error yea
		delete base.scoreData.judgements.error;
	} else if (base.game === "chunithm") {
		if (base.scoreData.percent === 101) {
			base.scoreData.grade = "SSS";
		}
	}

	if (base.service === "mm") {
		base.service = "maimagic";
	}

	const scoreID = CreateScoreID(base.userID, base, base.chartID);

	const score: ScoreDocument = {
		...base,
		scoreID,
	};

	return score;
}

(async () => {
	await MigrateRecords(db.scores, "scores", ConvertFn);

	process.exit(0);
})();
