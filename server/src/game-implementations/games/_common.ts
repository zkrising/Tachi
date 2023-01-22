import { CreatePBMergeFor } from "game-implementations/utils/pb-merge";
import { ProfileSumBestN } from "game-implementations/utils/profile-calc";
import { SessionAvgBest10For } from "game-implementations/utils/session-calc";
import { Volforce } from "rg-stats";
import {
	FmtNum,
	FmtNumCompact,
	GetGrade,
	GetGradeDeltas,
	IIDXLIKE_GBOUNDARIES,
	SDVXLIKE_GBOUNDARIES,
} from "tachi-common";
import { NumToDP, IsNullish } from "utils/misc";
import type {
	ChartSpecificMetricValidator,
	GPTClassDerivers,
	GPTDerivers,
	GPTGoalFormatters,
	GPTGoalProgressFormatters,
	GPTChartSpecificMetricValidators,
	GPTProfileCalculators,
	GPTScoreCalculators,
	GPTSessionCalculators,
	PBMergeFunction,
	ScoreCalculator,
	ScoreValidator,
} from "game-implementations/types";
import type {
	GPTStrings,
	GradeBoundary,
	integer,
	SpecificUserGameStats,
	GPTString,
	ScoreDocument,
} from "tachi-common";

export const EX_SCORE_CHECK: ChartSpecificMetricValidator<IIDXLikes> = (exScore, chart) => {
	if (exScore < 0) {
		return `EX Score cannot be negative.`;
	}

	if (exScore > chart.data.notecount * 2) {
		return `EX Score cannot be greater than ${chart.data.notecount * 2} for this chart.`;
	}

	return true;
};

function calculateIIDXLikePercent(exScore: integer, notecount: integer) {
	return (100 * exScore) / (notecount * 2);
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

export const IIDXLIKE_VALIDATORS: GPTChartSpecificMetricValidators<IIDXLikes> = {
	score: EX_SCORE_CHECK,
};

export const IIDXLIKE_SCORE_VALIDATORS: Array<ScoreValidator<IIDXLikes>> = [
	(s) => {
		const { pgreat, great } = s.scoreData.judgements;

		if (IsNullish(pgreat) || IsNullish(great)) {
			return;
		}

		if (pgreat * 2 + great !== s.scoreData.score) {
			return `Expected PGreat*2 + Great to equal EX score. Got ${pgreat}*2 + ${great} but that wasn't equal to the EX score of ${s.scoreData.score}.`;
		}
	},
];

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
	} else if (vf >= 19.5) {
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

export const SDVXLIKE_GOAL_FMT: GPTGoalFormatters<SDVXLikes> = {
	score: GoalFmtScore,
};

export const SDVXLIKE_GOAL_OO_FMT: GPTGoalFormatters<SDVXLikes> = {
	score: GoalOutOfFmtScore,
};

export const SDVXLIKE_GOAL_PG_FMT: GPTGoalProgressFormatters<SDVXLikes> = {
	score: (pb) => FmtNum(pb.scoreData.score),
	lamp: (pb) => pb.scoreData.lamp,
	grade: (pb, goalValue) =>
		GradeGoalFormatter(
			SDVXLIKE_GBOUNDARIES,
			pb.scoreData.grade,
			pb.scoreData.score,
			SDVXLIKE_GBOUNDARIES[goalValue]!.name
		),
};

export const SDVXLIKE_PB_MERGERS: Array<PBMergeFunction<SDVXLikes>> = [
	CreatePBMergeFor("largest", "enumIndexes.lamp", "Best Lamp", (base, score) => {
		base.scoreData.lamp = score.scoreData.lamp;
	}),
];

export const SDVXLIKE_DEFAULT_MERGE_NAME = "Best Score";

export const SDVXLIKE_SCORE_VALIDATORS: Array<ScoreValidator<SDVXLikes>> = [
	(s) => {
		if (s.scoreData.lamp === "PERFECT ULTIMATE CHAIN" && s.scoreData.score !== 10_000_000) {
			return "Cannot have a PERFECT ULTIMATE CHAIN without a perfect score.";
		}
	},
	(s) => {
		const { near, miss } = s.scoreData.judgements;

		if (s.scoreData.lamp === "PERFECT ULTIMATE CHAIN" && (miss ?? 0) + (near ?? 0) > 0) {
			return "Cannot have a PERFECT ULTIMATE CHAIN with any nears or misses.";
		} else if (s.scoreData.lamp === "ULTIMATE CHAIN" && (miss ?? 0) > 0) {
			return "Cannot have an ULTIMATE CHAIN with non-zero miss count.";
		}
	},
	(s) => {
		if (s.scoreData.lamp === "ULTIMATE CHAIN" && s.scoreData.score < 5_000_000) {
			return "Cannot have an ULTIMATE CHAIN with a score less than 5m.";
		}
	},
];

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
	return `Get ${NumToDP(val)}% on`;
}

export function GoalFmtScore(val: number) {
	return `Get a score of ${val.toLocaleString("en-GB")} on`;
}

export function GoalOutOfFmtPercent(val: number) {
	return `${NumToDP(val)}%`;
}

export function GoalOutOfFmtScore(val: number) {
	return val.toLocaleString("en-GB");
}

/**
 * Given some grade boundaries and some values, format a grade delta for a goal.
 *
 * I.e. if the goal is to S a chart (needing 900k) and the user has 840k, return
 * S-fmtNum(60_000).
 */
export function GradeGoalFormatter<G extends string>(
	gradeBoundaries: Array<GradeBoundary<G>>,
	scoreGrade: G,
	scoreValue: number,
	goalGrade: G,
	formatNumFn = FmtNumCompact
) {
	const { closer, lower, upper } = GetGradeDeltas(
		gradeBoundaries,
		scoreGrade,
		scoreValue,
		formatNumFn
	);

	// if upper doesn't exist, we have to return lower (this is a MAX)
	// or something.
	if (!upper) {
		return lower;
	}

	// if the upper bound is relevant to the grade we're looking for
	// i.e. the goal is to AAA a chart and the user has AA+20/AAA-100
	// prefer AAA-100 instead of AA+20.
	if (new RegExp(`^\\(?${goalGrade}\\)?-`, "u").exec(upper)) {
		return upper;
	}

	// otherwise, return whichever is closer.
	return closer === "lower" ? lower : upper;
}

/**
 * Run all of the provided validators on the given score.
 *
 * @returns undefined on success, an array of error messages (strings) on failure.
 */
export function RunValidators<GPT extends GPTString>(
	validators: Array<ScoreValidator<GPT>>,
	score: ScoreDocument<GPT>
) {
	const errs = [];

	for (const validator of validators) {
		const err = validator(score);

		if (err !== undefined) {
			errs.push(err);
		}
	}

	if (errs.length === 0) {
		return;
	}

	return errs;
}
