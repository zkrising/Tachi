import { GoalFmtPercent, GoalOutOfFmtPercent, GradeGoalFormatter } from "./_common";
import { CreatePBMergeFor } from "game-implementations/utils/pb-merge";
import { ProfileSumBestN } from "game-implementations/utils/profile-calc";
import { SessionAvgBest10For } from "game-implementations/utils/session-calc";
import { MaimaiDXRate } from "rg-stats";
import { GetGrade, MAIMAIDX_GBOUNDARIES } from "tachi-common";
import { IsNullish } from "utils/misc";
import type { GPTServerImplementation } from "game-implementations/types";

export const MAIMAIDX_IMPL: GPTServerImplementation<"maimaidx:Single"> = {
	chartSpecificValidators: {},
	derivers: {
		grade: ({ percent }) => GetGrade(MAIMAIDX_GBOUNDARIES, percent),
	},
	scoreCalcs: {
		rate: (scoreData, chart) => MaimaiDXRate.calculate(scoreData.percent, chart.levelNum),
	},
	sessionCalcs: { rate: SessionAvgBest10For("rate") },
	profileCalcs: {
		naiveRate: ProfileSumBestN("rate", 50),
	},
	classDerivers: {
		colour: (ratings) => {
			const rate = ratings.naiveRate;

			if (IsNullish(rate)) {
				return null;
			}

			if (rate >= 15000) {
				return "RAINBOW";
			} else if (rate >= 14500) {
				return "PLATINUM";
			} else if (rate >= 14000) {
				return "GOLD";
			} else if (rate >= 13000) {
				return "SILVER";
			} else if (rate >= 12000) {
				return "BRONZE";
			} else if (rate >= 10000) {
				return "PURPLE";
			} else if (rate >= 7000) {
				return "RED";
			} else if (rate >= 4000) {
				return "YELLOW";
			} else if (rate >= 2000) {
				return "GREEN";
			} else if (rate >= 1000) {
				return "BLUE";
			}

			return "WHITE";
		},
	},
	goalCriteriaFormatters: {
		percent: (v) => GoalFmtPercent(v, 4),
	},
	goalProgressFormatters: {
		percent: (pb) => `${pb.scoreData.percent.toFixed(4)}%`,
		lamp: (pb) => pb.scoreData.lamp,
		grade: (pb, gradeIndex) =>
			GradeGoalFormatter(
				MAIMAIDX_GBOUNDARIES,
				pb.scoreData.grade,
				pb.scoreData.percent,
				MAIMAIDX_GBOUNDARIES[gradeIndex]!.name,
				(v) => `${v.toFixed(4)}%`
			),
	},
	goalOutOfFormatters: {
		percent: (v) => GoalOutOfFmtPercent(v, 4),
	},
	pbMergeFunctions: [
		CreatePBMergeFor("largest", "enumIndexes.lamp", "Best Lamp", (base, score) => {
			base.scoreData.lamp = score.scoreData.lamp;
		}),
	],
	defaultMergeRefName: "Best Percent",
	scoreValidators: [
		(s) => {
			if (s.scoreData.lamp === "ALL PERFECT+" && s.scoreData.percent !== 101) {
				return "Cannot have an ALL PERFECT+ without 101%.";
			}

			if (s.scoreData.lamp !== "ALL PERFECT+" && s.scoreData.percent === 101) {
				return "A score of 101% should be an ALL PERFECT+";
			}

			if (s.scoreData.lamp === "ALL PERFECT" && s.scoreData.percent < 100.5) {
				return "Cannot have an ALL PERFECT without at least 100.5%.";
			}
		},
	],
};
