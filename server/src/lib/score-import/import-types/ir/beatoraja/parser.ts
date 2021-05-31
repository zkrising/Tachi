import { KtLogger } from "../../../../logger/logger";
import p from "prudence";
import ScoreImportFatalError from "../../../framework/score-importing/score-import-error";
import { FormatPrError } from "../../../../../utils/prudence";
import { BeatorajaChart, BeatorajaContext, BeatorajaScore } from "./types";
import { ConverterIRBeatoraja } from "./converter";
import { ParserFunctionReturnsSync } from "../../common/types";

const PR_BeatorajaScore = {
    sha256: "string",
    exscore: p.isPositiveInteger,
    passnotes: p.isPositiveInteger,
    gauge: p.or(p.isBetween(0, 100), p.is(-1)),
    deviceType: p.isIn("BM_CONTROLLER", "KEYBOARD"),
    minbp: p.or(p.isPositiveInteger, p.is(-1)),
    option: p.isBoundedInteger(0, 4),

    lntype: p.isIn(0, 1),
    clear: p.isIn(
        "NoPlay",
        "Failed",
        "LightAssistEasy",
        "Easy",
        "Normal",
        "Hard",
        "ExHard",
        "FullCombo",
        "Perfect"
    ),
    assist: p.is(0),
    maxcombo: p.isPositiveInteger,

    epg: p.isPositiveInteger,
    egr: p.isPositiveInteger,
    egd: p.isPositiveInteger,
    ebd: p.isPositiveInteger,
    epr: p.isPositiveInteger,
    lpg: p.isPositiveInteger,
    lgr: p.isPositiveInteger,
    lgd: p.isPositiveInteger,
    lbd: p.isPositiveInteger,
    lpr: p.isPositiveInteger,
    ems: p.isPositiveInteger,
    lms: p.isPositiveInteger,
};

const PR_BeatorajaChart = {
    md5: "string",
    sha256: "string",
    title: "string",
    subtitle: "string",
    genre: "string",
    artist: "string",
    subartist: "string",
    total: p.isPositive,

    // currently only accepted playtypes.
    mode: p.isIn("BEAT_7K", "BEAT_14K"),
    judge: p.isPositive,
    notes: p.isPositiveInteger,
    hasUndefinedLN: p.is(false),
    hasRandom: p.is(false),
};

export function ParseBeatorajaSingle(
    body: Record<string, unknown>,
    logger: KtLogger
): ParserFunctionReturnsSync<BeatorajaScore, BeatorajaContext> {
    const err = p(
        body.score,
        PR_BeatorajaScore,
        {},
        { allowExcessKeys: true, throwOnNonObject: false }
    );

    if (err) {
        throw new ScoreImportFatalError(
            400,
            FormatPrError(err, "Invalid Beatoraja Import - Score")
        );
    }

    const chartErr = p(
        body.chart,
        PR_BeatorajaChart,
        {},
        { allowExcessKeys: true, throwOnNonObject: false }
    );

    if (chartErr) {
        throw new ScoreImportFatalError(
            400,
            FormatPrError(chartErr, "Invalid Beatoraja Import - Chart")
        );
    }

    const client = body.client;

    if (client !== "beatoraja" && client !== "lr2oraja") {
        throw new ScoreImportFatalError(400, `Unknown client ${client}`);
    }

    // asserted using prudence.
    return {
        context: {
            client,
            chart: body.chart as BeatorajaChart,
        },
        game: "bms",
        iterable: ([body.score] as unknown) as BeatorajaScore[],
        classHandler: null,
    };
}
