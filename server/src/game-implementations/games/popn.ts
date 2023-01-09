import { GetGrade } from "./_common";
import { POPN_GBOUNDARIES } from "tachi-common";
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
};
