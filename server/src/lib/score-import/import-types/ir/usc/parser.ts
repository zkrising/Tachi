import ScoreImportFatalError from "../../../framework/score-importing/score-import-error";
import p from "prudence";
import { FormatPrError } from "utils/prudence";
import type { ParserFunctionReturns } from "../../common/types";
import type { IRUSCContext } from "./types";
import type { KtLogger } from "lib/logger/logger";
import type { PrudenceSchema } from "prudence";
import type { USCClientScore } from "server/router/ir/usc/_playtype/types";
import type { Playtypes } from "tachi-common";

const PR_USCIR_SCORE: PrudenceSchema = {
	score: p.isBoundedInteger(0, 10_000_000),
	gauge: p.isBetween(0, 1),
	timestamp: p.isPositiveInteger,
	crit: p.isPositiveInteger,
	near: p.isPositiveInteger,
	error: p.isPositiveInteger,
	early: p.optional(p.isPositiveInteger),
	late: p.optional(p.isPositiveInteger),
	combo: p.optional(p.isPositiveInteger),
	options: {
		gaugeType: p.isIn(0, 1, 2),
		mirror: "boolean",
		random: "boolean",
		autoFlags: p.isInteger,
	},
	windows: {
		perfect: p.isPositive,
		good: p.isPositive,
		hold: p.isPositive,
		miss: p.isPositive,
		slam: p.isPositive,
	},
};

export function ParseIRUSC(
	body: Record<string, unknown>,
	chartHash: string,
	playtype: Playtypes["usc"],
	_logger: KtLogger
): ParserFunctionReturns<USCClientScore, IRUSCContext> {
	const err = p(
		body.score,
		PR_USCIR_SCORE,
		{},
		{ throwOnNonObject: false, allowExcessKeys: true }
	);

	if (err) {
		throw new ScoreImportFatalError(400, FormatPrError(err, "Invalid USC Score."));
	}

	const score = body.score as USCClientScore;

	// Enforce null for this instead of undefined.
	// This is because FJSH cannot handle undefined properly.
	// Maybe fjsh should handle that, lol...
	score.early ??= null;
	score.late ??= null;
	score.combo ??= null;

	return {
		context: {
			chartHash,
			playtype,
			timeReceived: Date.now(),
		},
		game: "usc",
		iterable: [score] as Array<USCClientScore>,
		classHandler: null,
	};
}
