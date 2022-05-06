import ScoreImportFatalError from "../../../framework/score-importing/score-import-error";
import p from "prudence";
import { FormatPrError } from "utils/prudence";
import type { ParserFunctionReturns } from "../../common/types";
import type { BarbatosContext, BarbatosScore } from "./types";
import type { KtLogger } from "lib/logger/logger";

const PR_Barbatos = {
	difficulty: p.isIn(1, 2, 3, 4),
	level: p.isBoundedInteger(1, 20),
	song_id: p.isPositiveInteger,
	max_chain: p.isPositiveInteger,
	critical: p.isPositiveInteger,
	near_total: p.isPositiveInteger,
	near_fast: p.isPositiveInteger,
	near_slow: p.isPositiveInteger,
	score: p.isBoundedInteger(0, 10_000_000),
	error: p.isPositiveInteger,
	percent: p.isBetween(0, 100),
	did_fail: "boolean",
	clear_type: p.isIn(1, 2, 3, 4, 5),
	gauge_type: p.isIn(0, 1, 2, 3),
	is_skill_analyzer: "boolean",
};

export function ParseBarbatosSingle(
	body: Record<string, unknown>,
	logger: KtLogger
): ParserFunctionReturns<BarbatosScore, BarbatosContext> {
	const err = p(body, PR_Barbatos);

	if (err) {
		throw new ScoreImportFatalError(400, FormatPrError(err, "Invalid Barbatos Request"));
	}

	// asserted using prudence.
	return {
		context: { timeReceived: Date.now() },
		game: "sdvx",
		iterable: [body] as unknown as Array<BarbatosScore>,
		classHandler: null,
	};
}
