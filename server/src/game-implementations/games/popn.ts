import { GetGrade, GoalFmtScore, GradeGoalFormatter } from "./_common";
import { ProfileSumBestN } from "game-implementations/utils/profile-calc";
import { SessionAvgBest10For } from "game-implementations/utils/session-calc";
import { PopnClassPoints } from "rg-stats";
import { FmtNum, FmtNumCompact, POPN_GBOUNDARIES } from "tachi-common";
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
	validators: {},
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
};
