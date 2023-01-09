import { InternalFailure } from "lib/score-import/framework/common/converter-failures";
import { SDVXLIKE_GBOUNDARIES, IIDXLIKE_GBOUNDARIES } from "tachi-common";
import type {
	ChartSpecificMetricValidator,
	GPTDerivers,
	GPTMetricValidators,
} from "game-implementations/types";
import type { GradeBoundary, GPTStrings, integer } from "tachi-common";

/**
 * Util for getting a games' grade for a given score.
 */
export function GetGrade<G extends string>(grades: Array<GradeBoundary<G>>, score: number): G {
	// sort grades going downwards in their boundaries.
	const descendingGrades = grades.slice(0).sort((a, b) => b.lowerBound - a.lowerBound);

	for (const { name, lowerBound } of descendingGrades) {
		if (score >= lowerBound) {
			return name;
		}
	}

	throw new InternalFailure(`Could not resolve grade for score ${score}.`);
}

export const EX_SCORE_CHECK: ChartSpecificMetricValidator<IIDXLikes> = (exScore, chart) => {
	if (exScore < 0) {
		return `EX Score cannot be negative. Got ${exScore}.`;
	}

	if (exScore > chart.data.notecount * 2) {
		return `EX Score cannot be greater than ${
			chart.data.notecount * 2
		} for this chart. Got ${exScore}.`;
	}

	return true;
};

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

export const IIDXLIKE_VALIDATORS: GPTMetricValidators<IIDXLikes> = { score: EX_SCORE_CHECK };

type SDVXLikes = GPTStrings["sdvx" | "usc"];

export const SDVXLIKE_DERIVERS: GPTDerivers<SDVXLikes> = {
	grade: ({ score }) => GetGrade(SDVXLIKE_GBOUNDARIES, score),
};
