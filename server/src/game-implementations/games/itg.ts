import { GetGrade } from "./_common";
import { ITG_GBOUNDARIES } from "tachi-common";
import type { GPTServerImplementation } from "game-implementations/types";

export const ITG_STAMINA_IMPL: GPTServerImplementation<"itg:Stamina"> = {
	validators: {},
	derivers: {
		finalPercent: (metrics) => {
			// *important*
			// don't check if metrics.survivedPercent === 100, as due to floating
			// point inaccuracies, it's possible to have a 100% fail
			// (on extremely long charts, for example)
			if (metrics.lamp === "FAILED") {
				return metrics.survivedPercent;
			}

			return 100 + metrics.scorePercent;
		},
		grade: ({ scorePercent, lamp }) => {
			if (lamp === "FAILED") {
				return "F";
			}

			return GetGrade(ITG_GBOUNDARIES, scorePercent);
		},
	},
};
