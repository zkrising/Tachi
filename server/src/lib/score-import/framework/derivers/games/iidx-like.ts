import { GetGrade } from "../common-utils";
import { IIDXLIKE_GBOUNDARIES } from "tachi-common";
import type { GPTDerivers } from "../types";
import type { GPTStrings, integer } from "tachi-common";

function calculateIIDXLikePercent(exScore: integer, notecount: integer) {
	return exScore / (notecount * 2);
}

type IIDXLikes = GPTStrings["bms" | "iidx" | "pms"];

/**
 * Derivers for both IIDX SP and DP.
 *
 * and BMS. and PMS. They use the same things.
 */
export const IIDXLIKE_DERIVERS: GPTDerivers<IIDXLikes> = {
	percent: ({ score }, chart) => calculateIIDXLikePercent(score, chart.data.notecount),
	grade: ({ score }, chart) => {
		const percent = calculateIIDXLikePercent(score, chart.data.notecount);

		return GetGrade(IIDXLIKE_GBOUNDARIES, percent);
	},
};
