/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
// ^ ts eslint currently gets very confused about the complexity on show here
// sorry!

import { GetGrade } from "./common-utils";
import { IIDXLIKE_DERIVERS } from "./games/iidx-like";
import { SDVXLIKE_DERIVERS } from "./games/sdvx-like";
import {
	CHUNITHM_GBOUNDARIES,
	GITADORA_GBOUNDARIES,
	ITG_GBOUNDARIES,
	JUBEAT_GBOUNDARIES,
	MAIMAIDX_GBOUNDARIES,
	MUSECA_GBOUNDARIES,
	POPN_GBOUNDARIES,
	WACCA_GBOUNDARIES,
} from "tachi-common";
import type { GPTDerivers } from "./types";
import type { GPTString } from "tachi-common";

type AllGPTDerivers = {
	[GPT in GPTString]: GPTDerivers<GPT>;
};

/**
 * How do we derive the "derivedMetrics" for each game?
 */
export const GPT_DERIVERS: AllGPTDerivers = {
	// these games quite literally *all* work the same way.
	"bms:14K": IIDXLIKE_DERIVERS,
	"bms:7K": IIDXLIKE_DERIVERS,
	"pms:Controller": IIDXLIKE_DERIVERS,
	"pms:Keyboard": IIDXLIKE_DERIVERS,
	"iidx:SP": IIDXLIKE_DERIVERS,
	"iidx:DP": IIDXLIKE_DERIVERS,

	// same stuff.
	"sdvx:Single": SDVXLIKE_DERIVERS,
	"usc:Controller": SDVXLIKE_DERIVERS,
	"usc:Keyboard": SDVXLIKE_DERIVERS,

	"chunithm:Single": {
		grade: ({ score }) => GetGrade(CHUNITHM_GBOUNDARIES, score),
	},
	"wacca:Single": {
		grade: ({ score }) => GetGrade(WACCA_GBOUNDARIES, score),
	},
	"jubeat:Single": {
		grade: ({ score }) => GetGrade(JUBEAT_GBOUNDARIES, score),
	},
	"gitadora:Dora": {
		grade: ({ percent }) => GetGrade(GITADORA_GBOUNDARIES, percent),
	},
	"gitadora:Gita": {
		grade: ({ percent }) => GetGrade(GITADORA_GBOUNDARIES, percent),
	},
	"itg:Stamina": {
		finalPercent: (metrics) => {
			// *important*
			// don't check if metrics.survivedPercent === 100, as due to floating
			// point inaccuracies, it's possible to have a 100% fail
			// (on extremely long charts, for example)
			if (metrics.lamp.string === "FAILED") {
				return metrics.survivedPercent;
			}

			return 100 + metrics.scorePercent;
		},
		grade: ({ scorePercent, lamp }) => {
			if (lamp.string === "FAILED") {
				return "F";
			}

			return GetGrade(ITG_GBOUNDARIES, scorePercent);
		},
	},
	"maimaidx:Single": {
		grade: ({ percent }) => GetGrade(MAIMAIDX_GBOUNDARIES, percent),
	},
	"museca:Single": {
		grade: ({ score }) => GetGrade(MUSECA_GBOUNDARIES, score),
	},
	"popn:9B": {
		lamp: ({ clearMedal }) => {
			switch (clearMedal.string) {
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
		},
		grade: ({ score, clearMedal }) => {
			const gradeString = GetGrade(POPN_GBOUNDARIES, score);

			const c = clearMedal.string;

			// grades are kneecapped at "A" if you failed.
			if (
				score >= 90_000 &&
				(c === "failedCircle" || c === "failedDiamond" || c === "failedStar")
			) {
				return "A";
			}

			return gradeString;
		},
	},
};
