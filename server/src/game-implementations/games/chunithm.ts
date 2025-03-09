import { GoalFmtScore, GoalOutOfFmtScore, GradeGoalFormatter } from "./_common";
import { CreatePBMergeFor } from "game-implementations/utils/pb-merge";
import { ProfileAvgBestN } from "game-implementations/utils/profile-calc";
import { SessionAvgBest10For } from "game-implementations/utils/session-calc";
import { CHUNITHMRating } from "rg-stats";
import { CHUNITHM_GBOUNDARIES, FmtNum, GetGrade } from "tachi-common";
import { IsNullish } from "utils/misc";
import type { GPTServerImplementation } from "game-implementations/types";

export const CHUNITHM_IMPL: GPTServerImplementation<"chunithm:Single"> = {
	chartSpecificValidators: {},
	derivers: {
		grade: ({ score }) => GetGrade(CHUNITHM_GBOUNDARIES, score),
	},
	scoreCalcs: {
		rating: (scoreData, chart) => CHUNITHMRating.calculate(scoreData.score, chart.levelNum),
	},
	sessionCalcs: { naiveRating: SessionAvgBest10For("rating") },
	profileCalcs: { naiveRating: ProfileAvgBestN("rating", 30, false, 100) },
	classDerivers: {
		colour: (ratings) => {
			const rating = ratings.naiveRating;

			if (IsNullish(rating)) {
				return null;
			}

			if (rating >= 17) {
				return "RAINBOW_EXTREME";
			} else if (rating >= 16) {
				return "RAINBOW";
			} else if (rating >= 15.25) {
				return "PLATINUM";
			} else if (rating >= 14.5) {
				return "GOLD";
			} else if (rating >= 13.25) {
				return "SILVER";
			} else if (rating >= 12) {
				return "COPPER";
			} else if (rating >= 10) {
				return "PURPLE";
			} else if (rating >= 7) {
				return "RED";
			} else if (rating >= 4) {
				return "ORANGE";
			} else if (rating >= 2) {
				return "GREEN";
			}

			return "BLUE";
		},
	},
	goalCriteriaFormatters: {
		score: GoalFmtScore,
	},
	goalProgressFormatters: {
		grade: (pb, gradeIndex) =>
			GradeGoalFormatter(
				CHUNITHM_GBOUNDARIES,
				pb.scoreData.grade,
				pb.scoreData.score,
				CHUNITHM_GBOUNDARIES[gradeIndex]!.name
			),

		lamp: (pb) => pb.scoreData.lamp,
		score: (pb) => FmtNum(pb.scoreData.score),
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
			if (s.scoreData.lamp === "ALL JUSTICE CRITICAL" && s.scoreData.score !== 1_010_000) {
				return "An ALL JUSTICE CRITICAL must have a score of 1.01 million.";
			}

			if (s.scoreData.lamp !== "ALL JUSTICE CRITICAL" && s.scoreData.score === 1_010_000) {
				return "A score of 1.01 million must have a lamp of ALL JUSTICE CRITICAL.";
			}
		},
		(s) => {
			let { attack, justice, miss } = s.scoreData.judgements;

			justice ??= 0;
			attack ??= 0;
			miss ??= 0;

			if (s.scoreData.lamp === "ALL JUSTICE CRITICAL") {
				if (attack + justice + miss > 0) {
					return "Cannot have an ALL JUSTICE CRITICAL with any non-jcrit judgements.";
				}
			}

			if (s.scoreData.lamp === "ALL JUSTICE") {
				if (attack + miss > 0) {
					return "Cannot have an ALL JUSTICE if not all hits were justice or better.";
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
