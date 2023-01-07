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
