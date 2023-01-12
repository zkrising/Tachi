import { ProfileSumBestN } from "game-implementations/utils/profile-calc";
import { SessionAvgBest10For } from "game-implementations/utils/session-calc";
import { InternalFailure } from "lib/score-import/framework/common/converter-failures";
import { Volforce } from "rg-stats";
import { FmtNum, IIDXLIKE_GBOUNDARIES, SDVXLIKE_GBOUNDARIES } from "tachi-common";
import { FormatMaxDP, IsNullish } from "utils/misc";
import type {
	ChartSpecificMetricValidator,
	GPTClassDerivers,
	GPTDerivers,
	GPTGoalCriteriaFormatters,
	GPTGoalProgressFormatters,
	GPTMetricValidators,
	GPTProfileCalculators,
	GPTScoreCalculators,
	GPTSessionCalculators,
	ScoreCalculator,
} from "game-implementations/types";
import type { GPTStrings, GradeBoundary, integer, SpecificUserGameStats } from "tachi-common";

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

export const VF6Calc: ScoreCalculator<GPTStrings["sdvx" | "usc"]> = (scoreData, chart) =>
	Volforce.calculateVF6(scoreData.score, scoreData.lamp, chart.levelNum);

export function VF6ToClass(vf: number): SpecificUserGameStats<"sdvx:Single">["classes"]["vfClass"] {
	// jesus christ man
	if (vf >= 23) {
		return "IMPERIAL_IV";
	} else if (vf >= 22) {
		return "IMPERIAL_III";
	} else if (vf >= 21) {
		return "IMPERIAL_II";
	} else if (vf >= 20) {
		return "IMPERIAL_I";
	} else if (vf >= 19.75) {
		return "CRIMSON_IV";
	} else if (vf > 19.5) {
		return "CRIMSON_III";
	} else if (vf >= 19.25) {
		return "CRIMSON_II";
	} else if (vf >= 19) {
		return "CRIMSON_I";
	} else if (vf >= 18.75) {
		return "ELDORA_IV";
	} else if (vf >= 18.5) {
		return "ELDORA_III";
	} else if (vf >= 18.25) {
		return "ELDORA_II";
	} else if (vf >= 18) {
		return "ELDORA_I";
	} else if (vf >= 17.75) {
		return "ARGENTO_IV";
	} else if (vf >= 17.5) {
		return "ARGENTO_III";
	} else if (vf >= 17.25) {
		return "ARGENTO_II";
	} else if (vf >= 17) {
		return "ARGENTO_I";
	} else if (vf >= 16.75) {
		return "CORAL_IV";
	} else if (vf >= 16.5) {
		return "CORAL_III";
	} else if (vf >= 16.25) {
		return "CORAL_II";
	} else if (vf >= 16) {
		return "CORAL_I";
	} else if (vf >= 15.75) {
		return "SCARLET_IV";
	} else if (vf >= 15.5) {
		return "SCARLET_III";
	} else if (vf >= 15.25) {
		return "SCARLET_II";
	} else if (vf >= 15) {
		return "SCARLET_I";
	} else if (vf >= 14.75) {
		return "CYAN_IV";
	} else if (vf >= 14.5) {
		return "CYAN_III";
	} else if (vf >= 14.25) {
		return "CYAN_II";
	} else if (vf >= 14) {
		return "CYAN_I";
	} else if (vf >= 13.5) {
		return "DANDELION_IV";
	} else if (vf >= 13) {
		return "DANDELION_III";
	} else if (vf >= 12.5) {
		return "DANDELION_II";
	} else if (vf >= 12) {
		return "DANDELION_I";
	} else if (vf >= 11.5) {
		return "COBALT_IV";
	} else if (vf >= 11) {
		return "COBALT_III";
	} else if (vf >= 10.5) {
		return "COBALT_II";
	} else if (vf >= 10) {
		return "COBALT_I";
	} else if (vf >= 7.5) {
		return "SIENNA_IV";
	} else if (vf >= 5) {
		return "SIENNA_III";
	} else if (vf >= 2.5) {
		return "SIENNA_II";
	}

	return "SIENNA_I";
}

export const SDVXLIKE_SCORE_CALCS: GPTScoreCalculators<SDVXLikes> = { VF6: VF6Calc };

export const SDVXLIKE_SESSION_CALCS: GPTSessionCalculators<SDVXLikes> = {
	ProfileVF6: (arr) => {
		const v = SessionAvgBest10For("VF6")(arr);

		if (v !== null) {
			return v * 50;
		}

		return null;
	},
};

export const SDVXLIKE_PROFILE_CALCS: GPTProfileCalculators<SDVXLikes> = {
	VF6: ProfileSumBestN("VF6", 50),
};

export const SDVXLIKE_CLASS_DERIVERS: GPTClassDerivers<SDVXLikes> = {
	vfClass: (ratings) => {
		const vf6 = ratings.VF6;

		if (IsNullish(vf6)) {
			return null;
		}

		return VF6ToClass(vf6);
	},
};

export const SDVXLIKE_GOAL_FMT: GPTGoalCriteriaFormatters<SDVXLikes> = {
	score: GoalFmtScore,
};

export const SDVXLIKE_GOAL_PG_FMT: GPTGoalProgressFormatters<SDVXLikes> = {
	score: (pb) => FmtNum(pb.scoreData.score),
	lamp: (pb) => pb.scoreData.lamp,
};

export const SGLCalc: ScoreCalculator<GPTStrings["bms" | "pms"]> = (scoreData, chart) => {
	const ecValue = chart.data.sglEC ?? 0;
	const hcValue = chart.data.sglHC ?? 0;

	switch (scoreData.lamp) {
		case "FULL COMBO":
		case "EX HARD CLEAR":
		case "HARD CLEAR":
			return Math.max(hcValue, ecValue);
		case "CLEAR":
		case "EASY CLEAR":
			return ecValue;
		default:
			return 0;
	}
};

export function GoalFmtPercent(val: number) {
	return `Get ${FormatMaxDP(val)}% on`;
}

export function GoalFmtScore(val: number) {
	return `Get a score of ${val.toLocaleString("en-GB")} on`;
}

export function GoalGradeDeltaFmt(
	grades: ReadonlyArray<string>,
	score: integer,
	percent: number,
	grade: string,
	gradeIndex: number,
	// optionally, declare how the numeric part of the grade delta should be formatted.
	fmtFn: (n: number) => string = FmtNum
) {
	const goalGrade = grades[gradeIndex];

	if (!goalGrade) {
		throw new Error(`Tried to format ${gradeIndex}, but no such BMS 7K grade existed?`);
	}

	const { lower, upper, closer } = GenericFormatGradeDelta(grades, score, percent, grade, fmtFn);

	// If this goal is, say, AAA $chart, and the user's deltas are AA+40, AAA-100
	// instead of picking the one with less delta from the grade (AA+40)
	// pick the one closest to the target grade.
	// Because sometimes this function wraps the grade operand in brackets
	// (see (MAX-)-50), we need a regexp for this.
	// eslint-disable-next-line @typescript-eslint/prefer-optional-chain
	if (upper && new RegExp(`\\(?${goalGrade}`, "u").exec(upper)) {
		return upper;
	}

	// for some reason, our TS compiler disagrees that this is non-nullable.
	// but my IDE thinks it is. Who knows.
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
	return closer === "lower" ? lower : upper!;
}
