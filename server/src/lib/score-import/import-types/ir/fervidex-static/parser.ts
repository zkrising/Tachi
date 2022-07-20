import { CreateFerStaticClassHandler } from "./class-handler";
import { AssertStrAsPositiveInt } from "../../../framework/common/string-asserts";
import ScoreImportFatalError from "../../../framework/score-importing/score-import-error";
import { SoftwareIDToVersion } from "../fervidex/parser";
import p from "prudence";
import { IsRecord } from "utils/misc";
import { FormatPrError } from "utils/prudence";
import type { ParserFunctionReturns } from "../../common/types";
import type { FervidexStaticContext, FervidexStaticHeaders, FervidexStaticScore } from "./types";
import type { KtLogger } from "lib/logger/logger";
import type { PrudenceSchema } from "prudence";

const PR_FERVIDEX_STATIC: PrudenceSchema = {
	ex_score: p.isPositiveInteger,
	miss_count: p.optional(p.nullable(p.or(p.isPositiveInteger, p.is(-1)))),
	clear_type: p.isBoundedInteger(0, 7),
};

export function ParseFervidexStatic(
	body: Record<string, unknown>,
	headers: FervidexStaticHeaders,
	logger: KtLogger
): ParserFunctionReturns<FervidexStaticScore, FervidexStaticContext> {
	const version = SoftwareIDToVersion(headers.model, logger);
	const classHandler = CreateFerStaticClassHandler(body);

	// if we shouldn't import scores, just sync up dans.
	if (!headers.shouldImportScores) {
		return {
			context: { version },
			game: "iidx",
			iterable: [],
			classHandler,
		};
	}

	const staticScores = body.scores;

	if (!IsRecord(staticScores)) {
		throw new ScoreImportFatalError(400, `Invalid body.scores.`);
	}

	const scores: Array<FervidexStaticScore> = [];

	for (const [songID, subScores] of Object.entries(staticScores)) {
		const intSongID = AssertStrAsPositiveInt(songID, `Invalid songID ${songID}.`);

		if (!IsRecord(subScores)) {
			throw new ScoreImportFatalError(400, `Invalid score with songID ${songID}.`);
		}

		for (const [chart, score] of Object.entries(subScores)) {
			if (!IsRecord(score)) {
				throw new ScoreImportFatalError(
					400,
					`Invalid score with songID ${songID} at chart ${chart}.`
				);
			}

			if (!["spb", "spn", "dpn", "sph", "dph", "spa", "dpa", "spl", "dpl"].includes(chart)) {
				throw new ScoreImportFatalError(400, `Invalid chart ${chart}.`);
			}

			const err = p(score, PR_FERVIDEX_STATIC);

			if (err) {
				throw new ScoreImportFatalError(
					400,
					FormatPrError(err, `Invalid Score with songID ${songID} at chart ${chart}`)
				);
			}

			// is asserted by prudence.
			const sc = score as unknown as FervidexStaticScore;

			scores.push({
				song_id: intSongID,

				// is asserted with the above "spb"... check
				chart: chart as FervidexStaticScore["chart"],
				clear_type: sc.clear_type,
				ex_score: sc.ex_score,
				miss_count: sc.miss_count === undefined ? null : sc.miss_count,
			});
		}
	}

	// asserted using prudence.
	return {
		context: { version },
		game: "iidx",
		iterable: scores,
		classHandler,
	};
}
