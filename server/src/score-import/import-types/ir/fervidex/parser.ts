import { KtLogger, ParserFunctionReturnsSync } from "../../../../types";
import p, { PrudenceSchema } from "prudence";
import ScoreImportFatalError from "../../../framework/score-importing/score-import-error";
import { FormatPrError, optNull } from "../../../../common/prudence";
import { FervidexContext, FervidexScore } from "./types";
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

    "2dx-gsm": p.optional({
        // @ts-expect-error recursive types error
        EASY: [p.isBoundedInteger(0, 255)],
        NORMAL: [p.isBoundedInteger(0, 255)],
        HARD: [p.isBoundedInteger(0, 255)],
        EX_HARD: [p.isBoundedInteger(0, 255)],
    }),
};

/**
 * Converts a string of the form LDJ:X:X:X:2020092900 into a game version.
 * I don't really understand the software model format, so this is lazy.
 */
export function ParseSoftwareModel(model: string) {
    if (model.startsWith("LDJ")) {
        // heroic verse
        if (model.endsWith("2020092900")) {
            return "27";
        }

        // i *really* don't care enough to support rootage or cannonballers.
        throw new ScoreImportFatalError(400, `Unsupported Software Model ${model}.`);
    } else if (model.startsWith("P2D")) {
        // accept anything since this will probably change underfoot a lot.
        return "inf2020";
    }

    throw new ScoreImportFatalError(400, `Unsupported Software Model ${model}.`);
}

export interface FerHeaders {
    model: string;
}

export function ParseFervidexSingle(
    body: Record<string, unknown>,
    headers: FerHeaders,
    logger: KtLogger
): ParserFunctionReturnsSync<FervidexScore, FervidexContext> {
    let version = ParseSoftwareModel(headers.model);

    // more mods may be added in the future, so lets ignore excess keys.
    let err = p(body, PR_Fervidex, undefined, { allowExcessKeys: true });

    if (err) {
        throw new ScoreImportFatalError(400, FormatPrError(err, "Invalid Fervidex Request?"));
    }

    // asserted using prudence.
    return {
        context: { version },
        game: "iidx",
        iterable: ([body] as unknown) as FervidexScore[],
        ConverterFunction: ConverterIRFervidex,
        classHandler: null,
    };
}
