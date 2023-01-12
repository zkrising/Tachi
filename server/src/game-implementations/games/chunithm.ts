import { GetGrade, GoalFmtScore } from "./_common";
import { ProfileAvgBestN } from "game-implementations/utils/profile-calc";
import { SessionAvgBest10For } from "game-implementations/utils/session-calc";
import { CHUNITHMRating } from "rg-stats";
import { CHUNITHM_GBOUNDARIES, FmtNum } from "tachi-common";
import { IsNullish } from "utils/misc";
import type { GPTServerImplementation } from "game-implementations/types";

export const CHUNITHM_IMPL: GPTServerImplementation<"chunithm:Single"> = {
	validators: {},
	derivers: {
		grade: ({ score }) => GetGrade(CHUNITHM_GBOUNDARIES, score),
	},
	scoreCalcs: {
		rating: (scoreData, chart) => CHUNITHMRating.calculate(scoreData.score, chart.levelNum),
	},
	sessionCalcs: { naiveRating: SessionAvgBest10For("rating") },
	profileCalcs: { naiveRating: ProfileAvgBestN("rating", 20) },
	classDerivers: {
		colour: (ratings) => {
			const rating = ratings.naiveRating;

			if (IsNullish(rating)) {
				return null;
			}

			if (rating >= 15) {
				return "RAINBOW";
			} else if (rating >= 14.5) {
				return "PLATINUM";
			} else if (rating >= 14) {
				return "GOLD";
			} else if (rating >= 13) {
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
		grade: (pb, gradeIndex) => {
			return GoalGradeDeltaFmt(
				grades,
				pb.scoreData.score,
				pb.scoreData.percent,
				pb.scoreData.grade,
				gradeIndex,
				// 4519 -> "4519". Don't add commas or anything.
				(v) => v.toString()
			);
		},
		lamp: (pb) => pb.scoreData.lamp,
		score: (pb) => FmtNum(pb.scoreData.score),
	},
};
