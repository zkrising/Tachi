import { KtLogger } from "../../../../logger/logger";
import p, { PrudenceSchema } from "prudence";
import ScoreImportFatalError from "../../../framework/score-importing/score-import-error";
import { FormatPrError } from "../../../../../utils/prudence";
import { ConverterIRFervidexStatic } from "./converter";
import { FervidexStaticContext, FervidexStaticScore } from "./types";
import { FerHeaders, SoftwareIDToVersion } from "../fervidex/parser";
import { AssertStrAsPositiveInt } from "../../../framework/common/string-asserts";
import { CreateFerStaticClassHandler } from "./class-handler";
import { ParserFunctionReturnsSync } from "../../common/types";

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
    const version = SoftwareIDToVersion(headers.model);

    const staticScores = body?.scores;

    if (!staticScores || typeof staticScores !== "object") {
        throw new ScoreImportFatalError(400, `Invalid body.scores.`);
    }

    const scores: FervidexStaticScore[] = [];

    for (const songID in staticScores) {
        // @ts-expect-error pls.
        const subScores = staticScores[songID];

        const song_id = AssertStrAsPositiveInt(songID, `Invalid songID ${songID}.`);

        if (!subScores || typeof subScores !== "object") {
            throw new ScoreImportFatalError(400, `Invalid score with songID ${songID}.`);
        }

        for (const chart in subScores) {
            const score = subScores[chart];

            if (!score || typeof subScores !== "object") {
                throw new ScoreImportFatalError(
                    400,
                    `Invalid score with songID ${songID} at chart ${chart}.`
                );
            }

            if (!["spb", "spn", "dpn", "sph", "dph", "spa", "dpa", "spl", "dpl"].includes(chart)) {
                throw new ScoreImportFatalError(400, `Invalid chart ${chart}.`);
            }

            const err = p(score, PR_FervidexStatic);

            if (err) {
                throw new ScoreImportFatalError(
                    400,
                    FormatPrError(err, `Invalid Score with songID ${songID} at chart ${chart}`)
                );
            }

            scores.push({
                song_id,
                // is asserted with the above check
                chart: chart as FervidexStaticScore["chart"],
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
        classHandler: CreateFerStaticClassHandler(body),
    };
}
