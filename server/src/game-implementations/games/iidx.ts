import {
	GoalFmtPercent,
	GoalFmtScore,
	GradeGoalFormatter,
	IIDXLIKE_DERIVERS,
	IIDXLIKE_VALIDATORS,
} from "./_common";
import { ProfileAvgBestN } from "game-implementations/utils/profile-calc";
import { SessionAvgBest10For } from "game-implementations/utils/session-calc";
import { PoyashiBPI } from "rg-stats";
import { IIDXLIKE_GBOUNDARIES } from "tachi-common";
import type {
	GPTGoalCriteriaFormatters,
	GPTGoalProgressFormatters,
	GPTServerImplementation,
	ScoreCalculator,
} from "game-implementations/types";
import type { GPTStrings } from "tachi-common";

const BPICalc: ScoreCalculator<GPTStrings["iidx"]> = (scoreData, chart) => {
	if (chart.data.kaidenAverage === null || chart.data.worldRecord === null) {
		return null;
	}

	return PoyashiBPI.calculate(
		scoreData.score,
		chart.data.kaidenAverage,
		chart.data.worldRecord,
		chart.data.notecount * 2,
		chart.data.bpiCoefficient
	);
};

const IIDX_SESSION_CALCS: GPTServerImplementation<"iidx:DP" | "iidx:SP">["sessionCalcs"] = {
	BPI: SessionAvgBest10For("BPI"),
	ktLampRating: SessionAvgBest10For("ktLampRating"),
};

const IIDX_PROFILE_CALCS: GPTServerImplementation<"iidx:DP" | "iidx:SP">["profileCalcs"] = {
	BPI: ProfileAvgBestN("BPI", 20, true),
	ktLampRating: ProfileAvgBestN("ktLampRating", 20),
};

const IIDX_GOAL_FMT: GPTGoalCriteriaFormatters<"iidx:DP" | "iidx:SP"> = {
	percent: GoalFmtPercent,
	score: GoalFmtScore,
};

const IIDX_GOAL_PG_FMT: GPTGoalProgressFormatters<"iidx:DP" | "iidx:SP"> = {
	percent: (pb) => `${pb.scoreData.percent.toFixed(2)}%`,

	// 4519 -> "4519". Don't add commas or anything.
	score: (pb) => pb.scoreData.score.toString(),

	lamp: (pb) => {
		// if bp exists
		if (typeof pb.scoreData.optional.bp === "number") {
			return `${pb.scoreData.lamp} (BP: ${pb.scoreData.optional.bp})`;
		}

		return pb.scoreData.lamp;
	},
	grade: (pb, gradeIndex, chart) =>
		GradeGoalFormatter(
			IIDXLIKE_GBOUNDARIES,
			pb.scoreData.grade,
			pb.scoreData.percent,
			IIDXLIKE_GBOUNDARIES[gradeIndex]!.name,

			// use notecount to turn the percent deltas into whole ex-scores.
			(v) => Math.floor(v * chart.data.notecount * 2).toFixed(0)
		),
};

export const IIDX_SP_IMPL: GPTServerImplementation<"iidx:SP"> = {
	derivers: IIDXLIKE_DERIVERS,
	validators: IIDXLIKE_VALIDATORS,
	scoreCalcs: {
		BPI: BPICalc,
		ktLampRating: (scoreData, chart) => {
			// if chart has no ncValue, use the rating of the chart instead.
			const ncValue = chart.data.ncTier?.value ?? chart.levelNum;

			// if hc < nc, hcValue = ncValue
			// this means you can't lose score from getting a better clear.
			// same for exhc < hc.
			const hcValue = Math.max(chart.data.hcTier?.value ?? 0, ncValue);
			const exhcValue = Math.max(chart.data.exhcTier?.value ?? 0, hcValue);

			switch (scoreData.lamp) {
				case "FULL COMBO":
				case "EX HARD CLEAR":
					return exhcValue;
				case "HARD CLEAR":
					return hcValue;
				case "CLEAR":
					return ncValue;
				default:
					return 0;
			}
		},
	},
	sessionCalcs: IIDX_SESSION_CALCS,
	profileCalcs: IIDX_PROFILE_CALCS,
	classDerivers: {},
	goalCriteriaFormatters: IIDX_GOAL_FMT,
	goalProgressFormatters: IIDX_GOAL_PG_FMT,
};

export const IIDX_DP_IMPL: GPTServerImplementation<"iidx:DP"> = {
	derivers: IIDXLIKE_DERIVERS,
	validators: IIDXLIKE_VALIDATORS,
	scoreCalcs: {
		BPI: BPICalc,
		ktLampRating: (scoreData, chart) => {
			// if chart has no tier, use the rating of the chart instead.
			const ecValue = chart.data.dpTier?.value ?? chart.levelNum;

			switch (scoreData.lamp) {
				case "FULL COMBO":
				case "EX HARD CLEAR":
				case "HARD CLEAR":
				case "CLEAR":
				case "EASY CLEAR":
					return ecValue;
				default:
					return 0;
			}
		},
	},
	sessionCalcs: IIDX_SESSION_CALCS,
	profileCalcs: IIDX_PROFILE_CALCS,
	classDerivers: {},
	goalCriteriaFormatters: IIDX_GOAL_FMT,
	goalProgressFormatters: IIDX_GOAL_PG_FMT,
};
