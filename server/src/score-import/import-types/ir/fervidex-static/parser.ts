import { KtLogger, ParserFunctionReturnsSync } from "../../../../types";
import p, { PrudenceSchema } from "prudence";
import ScoreImportFatalError from "../../../framework/score-importing/score-import-error";
import { FormatPrError, optNull } from "../../../../common/prudence";
import { ConverterIRFervidex } from "./converter";
import { FervidexStaticContext, FervidexStaticScore } from "./types";
import { FerHeaders, ParseSoftwareModel } from "../fervidex/parser";
import { AssertStrAsPositiveInt } from "../../../framework/common/string-asserts";

const PR_FervidexStatic: PrudenceSchema = {
    ex_score: p.isPositiveInteger,
    miss_count: p.nullable(p.or(p.isPositiveInteger, p.is(-1))),
    clear_type: p.isBoundedInteger(0, 7),
};

export function ParseFervidexStatic(
    body: Record<string, unknown>,
    headers: FerHeaders,
    logger: KtLogger
): ParserFunctionReturnsSync<FervidexStaticScore, FervidexStaticContext> {
    let version = ParseSoftwareModel(headers.model);

    let staticScores = body?.scores;

    if (!staticScores || typeof staticScores !== "object") {
        throw new ScoreImportFatalError(400, `Invalid body.scores.`);
    }

    let scores: FervidexStaticScore[] = [];

    for (const songID in staticScores) {
        // @ts-expect-error pls.
        let subScores = staticScores[songID];

        let song_id = AssertStrAsPositiveInt(songID, `Invalid songID ${songID}.`);

        if (!subScores || typeof subScores !== "object") {
            throw new ScoreImportFatalError(400, `Invalid score with songID ${songID}.`);
        }

        for (const chart in subScores) {
            let score = subScores[chart];

            if (!score || typeof subScores !== "object") {
                throw new ScoreImportFatalError(
                    400,
                    `Invalid score with songID ${songID} at chart ${chart}.`
                );
            }

            let err = p(score, PR_FervidexStatic);

            if (err) {
                throw new ScoreImportFatalError(
                    400,
                    FormatPrError(err, `Invalid Score with songID ${songID} at chart ${chart}`)
                );
            }

            scores.push({
                song_id,
                chart,
                clear_type: score.clear_type,
                ex_score: score.ex_score,
                miss_count: score.miss_count,
            });
        }
    }

    // asserted using prudence.
    return {
        context: { version },
        game: "iidx",
        iterable: scores,
        ConverterFunction: ConverterIRFervidex,
    };
}
