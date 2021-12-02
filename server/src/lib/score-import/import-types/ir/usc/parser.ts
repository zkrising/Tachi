import { KtLogger } from "lib/logger/logger";
import p, { PrudenceSchema } from "prudence";
import { FormatPrError } from "utils/prudence";
import ScoreImportFatalError from "../../../framework/score-importing/score-import-error";
import { ParserFunctionReturns } from "../../common/types";
import { IRUSCContext } from "./types";
import { Playtypes } from "tachi-common";
import { USCClientScore } from "server/router/ir/usc/_playtype/types";

const PR_USCIRScore: PrudenceSchema = {
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
	logger: KtLogger
): ParserFunctionReturns<USCClientScore, IRUSCContext> {
	const err = p(
		body.score,
		PR_USCIRScore,
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
		},
		game: "usc",
		iterable: [score] as USCClientScore[],
		classHandler: null,
	};
}
