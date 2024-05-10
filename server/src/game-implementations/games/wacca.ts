import { GoalFmtScore, GoalOutOfFmtScore, GradeGoalFormatter } from "./_common";
import { CreatePBMergeFor } from "game-implementations/utils/pb-merge";
import { ProfileSumBestN } from "game-implementations/utils/profile-calc";
import { SessionAvgBest10For } from "game-implementations/utils/session-calc";
import { WACCARate } from "rg-stats";
import { FmtNum, GetGrade, WACCA_GBOUNDARIES } from "tachi-common";
import { IsNullish } from "utils/misc";
import type { GPTServerImplementation } from "game-implementations/types";

export const WACCA_IMPL: GPTServerImplementation<"wacca:Single"> = {
	chartSpecificValidators: {},
	derivers: {
		grade: ({ score }) => GetGrade(WACCA_GBOUNDARIES, score),
	},
	scoreCalcs: {
		rate: (scoreData, chart) => WACCARate.calculate(scoreData.score, chart.levelNum),
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

			if (rate >= 2500) {
				return "RAINBOW";
			} else if (rate >= 2200) {
				return "GOLD";
			} else if (rate >= 1900) {
				return "SILVER";
			} else if (rate >= 1600) {
				return "BLUE";
			} else if (rate >= 1300) {
				return "PURPLE";
			} else if (rate >= 1000) {
				return "RED";
			} else if (rate >= 600) {
				return "YELLOW";
			} else if (rate >= 300) {
				return "NAVY";
			}

			return "ASH";
		},
	},
	goalCriteriaFormatters: {
		score: GoalFmtScore,
	},
	goalProgressFormatters: {
		score: (pb) => FmtNum(pb.scoreData.score),
		lamp: (pb) => pb.scoreData.lamp,
		grade: (pb, gradeIndex) =>
			GradeGoalFormatter(
				WACCA_GBOUNDARIES,
				pb.scoreData.grade,
				pb.scoreData.score,
				WACCA_GBOUNDARIES[gradeIndex]!.name
			),
	},
	goalOutOfFormatters: {
		score: GoalOutOfFmtScore,
	},
	pbMergeFunctions: [
		CreatePBMergeFor("largest", "enumIndexes.lamp", "Best Lamp", (base, score) => {
			base.scoreData.lamp = score.scoreData.lamp;
		}),
	],
	defaultMergeRefName: "Best Score",

	scoreValidators: [
		(s) => {
			if (s.scoreData.lamp === "ALL MARVELOUS" && s.scoreData.score !== 1_000_000) {
				return `ALL MARVELOUS scores must have a perfect score. Got ${s.scoreData.score} instead.`;
			}

			// goes both ways
			if (s.scoreData.score === 1_000_000 && s.scoreData.lamp !== "ALL MARVELOUS") {
				return `Perfect scores of 1 million must have ALL MARVELOUS as their lamp. Got ${s.scoreData.lamp} instead.`;
			}
		},
		(s) => {
			const { miss } = s.scoreData.judgements;

			if (miss === null || miss === undefined || miss === 0) {
				return;
			}

			if (s.scoreData.lamp === "FULL COMBO") {
				return "Cannot have a FULL COMBO with misses.";
			}

			if (miss > 5 && s.scoreData.lamp === "MISSLESS") {
				return "Cannot have a MISSLESS lamp with >5 misses.";
			}
		},
		(s) => {
			const { miss, good, great } = s.scoreData.judgements;

			if (s.scoreData.lamp === "ALL MARVELOUS") {
				const mistakes = (miss ?? 0) + (good ?? 0) + (great ?? 0);

				if (mistakes > 0) {
					return "Cannot have an ALL MARVELOUS if all judgements were not marvelous.";
				}
			}
		},
	],
};
