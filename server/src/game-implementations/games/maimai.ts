import { GoalFmtPercent, GoalOutOfFmtPercent, GradeGoalFormatter } from "./_common";
import { CreatePBMergeFor } from "game-implementations/utils/pb-merge";
import { ProfileAvgBestN } from "game-implementations/utils/profile-calc";
import { SessionAvgBest10For } from "game-implementations/utils/session-calc";
import { MaimaiRate } from "rg-stats";
import { GetGrade, MAIMAI_GBOUNDARIES } from "tachi-common";
import { IsNullish } from "utils/misc";
import type { GPTServerImplementation } from "game-implementations/types";

export const MAIMAI_IMPL: GPTServerImplementation<"maimai:Single"> = {
	chartSpecificValidators: {
		percent: (percent, chart) => {
			if (percent < 0) {
				return "Percent cannot be negative.";
			}

			if (percent > chart.data.maxPercent) {
				return `Percent cannot be greater than ${chart.data.maxPercent} for this chart.`;
			}

			return true;
		},
	},
	derivers: {
		grade: ({ percent }) => GetGrade(MAIMAI_GBOUNDARIES, percent),
	},
	scoreCalcs: {
		rate: (scoreData, chart) =>
			MaimaiRate.calculate(scoreData.percent, chart.data.maxPercent, chart.levelNum),
	},
	sessionCalcs: { rate: SessionAvgBest10For("rate") },
	profileCalcs: {
		naiveRate: ProfileAvgBestN("rate", 30),
	},
	classDerivers: {
		colour: (ratings) => {
			const rate = ratings.naiveRate;

			if (IsNullish(rate)) {
				return null;
			}

			if (rate >= 15) {
				return "RAINBOW";
			} else if (rate >= 14.5) {
				return "GOLD";
			} else if (rate >= 14) {
				return "SILVER";
			} else if (rate >= 13) {
				return "BRONZE";
			} else if (rate >= 12) {
				return "PURPLE";
			} else if (rate >= 10) {
				return "RED";
			} else if (rate >= 7) {
				return "YELLOW";
			} else if (rate >= 4) {
				return "GREEN";
			} else if (rate >= 2) {
				return "BLUE";
			}

			return "WHITE";
		},
	},
	goalCriteriaFormatters: {
		percent: GoalFmtPercent,
	},
	goalProgressFormatters: {
		percent: (pb) => `${pb.scoreData.percent.toFixed(2)}%`,
		lamp: (pb) => pb.scoreData.lamp,
		grade: (pb, gradeIndex) =>
			GradeGoalFormatter(
				MAIMAI_GBOUNDARIES,
				pb.scoreData.grade,
				pb.scoreData.percent,
				MAIMAI_GBOUNDARIES[gradeIndex]!.name,
				(v) => `${v.toFixed(2)}%`
			),
	},
	goalOutOfFormatters: {
		percent: GoalOutOfFmtPercent,
	},
	pbMergeFunctions: [
		CreatePBMergeFor("largest", "enumIndexes.lamp", "Best Lamp", (base, score) => {
			base.scoreData.lamp = score.scoreData.lamp;
		}),
	],
	defaultMergeRefName: "Best Percent",
	scoreValidators: [
		(s) => {
			if (s.scoreData.percent > 104) {
				return "Score cannot be greater than 104%.";
			}
		},
		(s) => {
			let { great, good, miss, perfect } = s.scoreData.judgements;

			perfect ??= 0;
			great ??= 0;
			good ??= 0;
			miss ??= 0;

			if (s.scoreData.lamp === "ALL PERFECT") {
				if (great + good + miss > 0) {
					return "Cannot have an ALL PERFECT with any non-jcrit judgements.";
				}
			}

			if (s.scoreData.lamp === "FULL COMBO") {
				if (miss > 0) {
					return "Cannot have a FULL COMBO if the score has misses.";
				}
			}
		},
	],
};
