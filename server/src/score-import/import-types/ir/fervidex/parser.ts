import { EmptyObject, KtLogger, ParserFunctionReturnsSync } from "../../../../types";
import p, { ValidSchemaValue, PrudenceSchema } from "prudence";
import ScoreImportFatalError from "../../../framework/score-importing/score-import-error";
import { FormatPrError, optNull } from "../../../../common/prudence";
import { FervidexScore } from "./types";
import { ConverterIRFervidex } from "./converter";

const PR_Fervidex: PrudenceSchema = {
    chart: p.isIn("spb", "spn", "dpn", "sph", "dph", "spa", "dpa", "spl", "dpl"),
    entry_id: p.isPositiveInteger,

    pgreat: p.isPositiveInteger,
    great: p.isPositiveInteger,
    good: p.isPositiveInteger,
    bad: p.isPositiveInteger,
    poor: p.isPositiveInteger,

    slow: p.isPositiveInteger,
    fast: p.isPositiveInteger,
    max_combo: p.isPositiveInteger,

    ex_score: p.isPositiveInteger,
    clear_type: p.isBoundedInteger(0, 7),

    gauge: [p.isBoundedInteger(0, 255)],

    dead: {
        measure: optNull(p.isPositiveInteger),
        note: optNull(p.isPositiveInteger),
    },

    option: {
        gauge: optNull(p.isIn("ASSISTED_EASY", "EASY", "HARD", "EX_HARD")),
        range: optNull(
            p.isIn("SUDDEN_PLUS", "HIDDEN_PLUS", "SUD_PLUS_HID_PLUS", "LIFT", "LIFT_SUD_PLUS")
        ),
        style: optNull(p.isIn("RANDOM", "R_RANDOM", "S_RANDOM", "MIRROR")),
        assist: optNull(p.isIn("AUTO_SCRATCH", "LEGACY_NOTE", "ASCR_LEGACY", "FULL_ASSIST")),
    },

    // we dont use it and we dont care.
    pacemaker: p.optional(p.any),
};

export function ParseFervidexSingle(
    body: Record<string, unknown>,
    logger: KtLogger
): ParserFunctionReturnsSync<FervidexScore, EmptyObject> {
    let err = p(body, PR_Fervidex);

    if (err) {
        throw new ScoreImportFatalError(400, FormatPrError(err, "Invalid Fervidex Request?"));
    }

    // asserted using prudence.
    return {
        context: {},
        game: "iidx",
        iterable: ([body] as unknown) as FervidexScore[],
        ConverterFunction: ConverterIRFervidex,
    };
}
