import { KtLogger } from "../../../../utils/types";
import p, { PrudenceSchema, ValidSchemaValue } from "prudence";
import ScoreImportFatalError from "../../../framework/score-importing/score-import-error";
import { FormatPrError, optNull } from "../../../../utils/prudence";
import { FervidexContext, FervidexScore } from "./types";
import { ConverterIRFervidex } from "./converter";
import { ParseEA3SoftID } from "../../../../utils/util";
import {
    EXT_HEROIC_VERSE,
    MODEL_IIDX,
    MODEL_INFINITAS_2,
    REV_2DXTRA,
    REV_OMNIMIX,
} from "../../../../constants/ea3id";
import { ParserFunctionReturnsSync } from "../../common/types";

const PR_Fervidex: PrudenceSchema = {
    chart: p.isIn("spb", "spn", "dpn", "sph", "dph", "spa", "dpa", "spl", "dpl"),
    entry_id: p.isPositiveInteger,
    chart_sha256: "string",
    custom: "boolean",

    pgreat: p.isPositiveInteger,
    great: p.isPositiveInteger,
    good: p.isPositiveInteger,
    bad: p.isPositiveInteger,
    poor: p.isPositiveInteger,

    slow: p.isPositiveInteger,
    fast: p.isPositiveInteger,
    max_combo: p.isPositiveInteger,
    combo_break: p.isPositiveInteger,

    ex_score: p.isPositiveInteger,
    clear_type: p.isBoundedInteger(0, 7),

    gauge: [p.isBoundedInteger(0, 255)],
    ghost: [p.isBoundedInteger(0, 100)],

    dead: p.optional(({
        measure: optNull(p.isPositiveInteger),
        note: optNull(p.isPositiveInteger),
    } as unknown) as ValidSchemaValue),

    option: {
        gauge: optNull(p.isIn("ASSISTED_EASY", "EASY", "HARD", "EX_HARD")),
        range: optNull(
            p.isIn("SUDDEN_PLUS", "HIDDEN_PLUS", "SUD_PLUS_HID_PLUS", "LIFT", "LIFT_SUD_PLUS")
        ),
        style: optNull(p.isIn("RANDOM", "R_RANDOM", "S_RANDOM", "MIRROR")),
        assist: optNull(p.isIn("AUTO_SCRATCH", "LEGACY_NOTE", "ASCR_LEGACY", "FULL_ASSIST")),
    },

    // we dont use it and we dont care.
    pacemaker: p.any,

    "2dx-gsm": p.optional({
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
export function SoftwareIDToVersion(model: string) {
    try {
        const data = ParseEA3SoftID(model);

        if (data.model === MODEL_INFINITAS_2) {
            return "inf";
        } else if (data.model === MODEL_IIDX) {
            // only HV. everything else is disabled deliberately.
            if (data.ext === EXT_HEROIC_VERSE) {
                // @hack This is a hack workaround. For custom charts such as kichiku and kiraku
                // they use a sha256 lookup which skips version lookups so we do not need a version
                // for 2dxtra specifically.
                if (data.rev === REV_OMNIMIX || data.rev === REV_2DXTRA) {
                    return "27-omni";
                }

                return "27";
            }
        }

        throw new ScoreImportFatalError(400, `Unsupported Software Model ${model}.`);
    } catch (err) {
        throw new ScoreImportFatalError(400, `Unsupported Software Model ${model}`);
    }
}

export interface FerHeaders {
    model: string;
}

export function ParseFervidexSingle(
    body: Record<string, unknown>,
    headers: FerHeaders,
    logger: KtLogger
): ParserFunctionReturnsSync<FervidexScore, FervidexContext> {
    const version = SoftwareIDToVersion(headers.model);

    // more mods may be added in the future, so lets ignore excess keys.
    const err = p(body, PR_Fervidex, undefined, { allowExcessKeys: true });

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
