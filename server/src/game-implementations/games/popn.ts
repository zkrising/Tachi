import { GoalFmtScore, GoalOutOfFmtScore, GradeGoalFormatter } from "./_common";
import { CreatePBMergeFor } from "game-implementations/utils/pb-merge";
import { ProfileSumBestN } from "game-implementations/utils/profile-calc";
import { SessionAvgBest10For } from "game-implementations/utils/session-calc";
import { PopnClassPoints } from "rg-stats";
import { FmtNum, FmtNumCompact, GetGrade, POPN_GBOUNDARIES } from "tachi-common";
import { IsNullish } from "utils/misc";
import type { GPTServerImplementation } from "game-implementations/types";
import type { GetEnumValue } from "tachi-common/types/metrics";

export function PopnClearMedalToLamp(
	clearMedal: GetEnumValue<"popn:9B", "clearMedal">
): GetEnumValue<"popn:9B", "lamp"> {
	switch (clearMedal) {
		case "perfect":
			return "PERFECT";
		case "fullComboCircle":
		case "fullComboDiamond":
		case "fullComboStar":
			return "FULL COMBO";
		case "clearCircle":
		case "clearDiamond":
		case "clearStar":
			return "CLEAR";
		case "easyClear":
			return "EASY CLEAR";
		case "failedCircle":
		case "failedDiamond":
		case "failedStar":
			return "FAILED";
	}
}

export const POPN_9B_IMPL: GPTServerImplementation<"popn:9B"> = {
	chartSpecificValidators: {},
	derivers: {
		lamp: ({ clearMedal }) => PopnClearMedalToLamp(clearMedal),
		grade: ({ score, clearMedal }) => {
			const gradeString = GetGrade(POPN_GBOUNDARIES, score);

			// lol double-calc
			const lamp = PopnClearMedalToLamp(clearMedal);

			// grades are kneecapped at "A" if you failed.
			if (score >= 90_000 && lamp === "FAILED") {
				return "A";
			}

			return gradeString;
		},
	},
	scoreCalcs: {
		classPoints: (scoreData, chart) =>
			PopnClassPoints.calculate(
				scoreData.score,
				PopnClearMedalToLamp(scoreData.clearMedal),
				chart.levelNum
			),
	},
	sessionCalcs: { classPoints: SessionAvgBest10For("classPoints") },
	profileCalcs: {
		naiveClassPoints: ProfileSumBestN("classPoints", 20),
	},
	classDerivers: {
		class: (ratings) => {
			const points = ratings.naiveClassPoints;

			if (IsNullish(points)) {
				return null;
			}

			if (points < 21) {
				return "KITTY";
			} else if (points < 34) {
				return "STUDENT";
			} else if (points < 46) {
				return "DELINQUENT";
			} else if (points < 59) {
				return "DETECTIVE";
			} else if (points < 68) {
				return "IDOL";
			} else if (points < 79) {
				return "GENERAL";
			} else if (points < 91) {
				return "HERMIT";
			}

			return "GOD";
		},
	},
	goalCriteriaFormatters: {
		score: GoalFmtScore,
	},
	goalProgressFormatters: {
		score: (pb) => FmtNum(pb.scoreData.score),
		clearMedal: (pb) => pb.scoreData.clearMedal,
		lamp: (pb) => pb.scoreData.lamp,
		grade: (pb, gradeIndex) =>
			GradeGoalFormatter(
				POPN_GBOUNDARIES,
				pb.scoreData.grade,
				pb.scoreData.score,
				POPN_GBOUNDARIES[gradeIndex]!.name
			),
	},
	goalOutOfFormatters: {
		score: GoalOutOfFmtScore,
	},
	pbMergeFunctions: [
		CreatePBMergeFor("largest", "enumIndexes.clearMedal", "Best Clear", (base, score) => {
			base.scoreData.clearMedal = score.scoreData.clearMedal;
			// these are directly related. pluck both.
			base.scoreData.lamp = score.scoreData.lamp;
		}),
	],
	defaultMergeRefName: "Best Score",
	scoreValidators: [
		(s) => {
			const { bad, good } = s.scoreData.judgements;

			if (s.scoreData.lamp === "PERFECT") {
				const mistakes = (bad ?? 0) + (good ?? 0);

				if (mistakes > 0) {
					return "Cannot have a PERFECT lamp with any bads or goods.";
				}
			} else if (s.scoreData.lamp === "FULL COMBO") {
				const mistakes = bad ?? 0;

				if (mistakes > 0) {
					return "Cannot have a FULL COMBO lamp with any bads.";
				}
			}
		},
		// clear medal bad/good checks.
		(s) => {
			let { bad, good } = s.scoreData.judgements;

			bad ??= 0;
			good ??= 0;

			switch (s.scoreData.clearMedal) {
				case "fullComboStar": {
					if (good > 5 || good < 1) {
						return "Must have between 1-5 goods for a full combo star.";
					}

					break;
				}

				case "fullComboDiamond": {
					if (good > 20 || good < 6) {
						return "Must have between 6-20 goods for a full combo diamond.";
					}

					break;
				}

				case "fullComboCircle": {
					if (good < 21) {
						return "Must have >21 goods for a full combo circle.";
					}

					break;
				}

				case "clearStar": {
					if (bad > 5 || bad < 1) {
						return "Must have between 1-5 bads for a clear star.";
					}

					break;
				}

				case "clearDiamond": {
					if (bad > 20 || bad < 6) {
						return "Must have between 6-20 bads for a clear diamond.";
					}

					break;
				}

				case "clearCircle": {
					if (bad < 21) {
						return "Must have between >21 bads for a clear circle.";
					}

					break;
				}

				// can't validate the fails since we don't have the gauge info.
				default:
			}
		},
	],
};
