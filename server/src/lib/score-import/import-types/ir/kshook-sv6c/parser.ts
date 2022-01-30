import { KtLogger } from "lib/logger/logger";
import ScoreImportFatalError from "lib/score-import/framework/score-importing/score-import-error";
import p, { PrudenceSchema } from "prudence";
import { FormatPrError } from "utils/prudence";
import { ParserFunctionReturns } from "../../common/types";
import { KsHookSV6CContext, KsHookSV6CScore } from "./types";

const PR_KsHookSV6C: PrudenceSchema = {
	clear: p.isIn(
		"CLEAR_PLAYED",
		"CLEAR_EFFECTIVE",
		"CLEAR_EXCESSIVE",
		"CLEAR_ULTIMATE_CHAIN",
		"CLEAR_PERFECT"
	),
	difficulty: p.isIn(
		"DIFFICULTY_NOVICE",
		"DIFFICULTY_ADVANCED",
		"DIFFICULTY_EXHAUST",
		"DIFFICULTY_INFINITE",
		"DIFFICULTY_MAXIMUM"
	),
	gauge: p.isBetween(0, 10000),
	grade: p.isIn(
		"GRADE_D",
		"GRADE_C",
		"GRADE_B",
		"GRADE_A",
		"GRADE_A_PLUS",
		"GRADE_AA",
		"GRADE_AA_PLUS",
		"GRADE_AAA",
		"GRADE_AAA_PLUS",
		"GRADE_S"
	),
	max_chain: p.isPositiveInteger,
	music_id: p.isPositiveInteger,

	btn_rate: p.isBetween(0, 200),
	long_rate: p.isBetween(0, 200),
	vol_rate: p.isBetween(0, 200),

	ex_score: p.isPositiveInteger,

	rate: p.isIn("RATE_EFFECTIVE", "RATE_PERMISSIVE", "RATE_EXCESSIVE", "RATE_BLASTIVE"),

	track_no: p.isPositiveInteger,
};

export function ParseKsHookSV6C(
	body: Record<string, unknown>,
	logger: KtLogger
): ParserFunctionReturns<KsHookSV6CScore, KsHookSV6CContext> {
	// Ignore excess keys, as SV6C might add more features in the future.
	const err = p(body, PR_KsHookSV6C, undefined, { allowExcessKeys: true });

	if (err) {
		throw new ScoreImportFatalError(400, FormatPrError(err));
	}

	const score = body as unknown as KsHookSV6CScore;

	return {
		game: "sdvx",
		iterable: [score],
		context: {
			timeReceived: Date.now(),
		},
		classHandler: null,
	};
}
