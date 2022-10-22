import { PR_KSHOOK_SV6C } from "../kshook-sv6c/parser";
import ScoreImportFatalError from "lib/score-import/framework/score-importing/score-import-error";
import p from "prudence";
import { FormatPrError } from "utils/prudence";
import type { ParserFunctionReturns } from "../../common/types";
import type { KsHookSV6CStaticBody, KsHookSV6CStaticScore } from "./types";
import type { KtLogger } from "lib/logger/logger";
import type { PrudenceSchema } from "prudence";
import type { EmptyObject } from "utils/types";

const PR_KSHOOK_SV6C_STATIC: PrudenceSchema = {
	scores: [
		{
			score: PR_KSHOOK_SV6C.score!,
			ex_score: PR_KSHOOK_SV6C.ex_score!,
			clear: PR_KSHOOK_SV6C.clear!,
			difficulty: PR_KSHOOK_SV6C.difficulty!,
			grade: PR_KSHOOK_SV6C.grade!,
			max_chain: PR_KSHOOK_SV6C.max_chain!,
			music_id: PR_KSHOOK_SV6C.music_id!,

			timestamp: p.isPositiveInteger,
		},
	],
};

export function ParseKsHookSV6CStatic(
	body: Record<string, unknown>,
	_logger: KtLogger
): ParserFunctionReturns<KsHookSV6CStaticScore, EmptyObject> {
	// Ignore excess keys, as SV6C might add more features in the future.
	const err = p(body, PR_KSHOOK_SV6C_STATIC, undefined, { allowExcessKeys: true });

	if (err) {
		throw new ScoreImportFatalError(400, FormatPrError(err));
	}

	const data = body as unknown as KsHookSV6CStaticBody;

	return {
		game: "sdvx",
		iterable: data.scores,
		context: {},
		classHandler: null,
	};
}
