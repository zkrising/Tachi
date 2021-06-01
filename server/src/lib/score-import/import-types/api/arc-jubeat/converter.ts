import { EmptyObject } from "../../../../../utils/types";
import { ConverterFunction } from "../../common/types";
import p, { PrudenceSchema } from "prudence";
import {
    InvalidScoreFailure,
    KTDataNotFoundFailure,
} from "../../../framework/common/converter-failures";
import { FormatPrError } from "../../../../../utils/prudence";
import { ARCJubeatScore } from "./types";
import { FindChartOnARCID } from "../../../../../utils/queries/charts";
import { FindSongOnIDGuaranteed } from "../../../../../utils/queries/songs";
import { DryScore } from "../../../framework/common/types";
import {
    GenericGetGradeAndPercent,
    ParseDateFromString,
} from "../../../framework/common/score-utils";
import { Lamps, integer } from "kamaitachi-common";

// There's a bunch of other useless fields but we don't care
const PR_ArcJubeatScore: PrudenceSchema = {
    chart_id: "string",
    clear_type: p.isIn("FULL_COMBO", "CLEAR", "EXC", "FAIL"),
    score: p.isBoundedInteger(0, 1_000_000),
    timestamp: "string",
};

export const ConvertAPIArcJubeat: ConverterFunction<unknown, EmptyObject> = async (
    data,
    context,
    importType,
    logger
) => {
    const err = p(data, PR_ArcJubeatScore, {}, { throwOnNonObject: false, allowExcessKeys: true });

    if (err) {
        throw new InvalidScoreFailure(FormatPrError(err, "Invalid ARC Score: "));
    }

    // confirmed by Prudence above.
    const score = data as ARCJubeatScore;

    const chart = await FindChartOnARCID("jubeat", score.chart_id);

    if (!chart) {
        throw new KTDataNotFoundFailure(
            `Could not find chart with chart_id ${score.chart_id}.`,
            importType,
            data,
            context
        );
    }

    const song = await FindSongOnIDGuaranteed("jubeat", chart.songID, logger);

    const { grade, percent } = GenericGetGradeAndPercent("jubeat", score.score, chart);

    const timeAchieved = ParseDateFromString(score.timestamp);

    const lamp = ResolveARCJubeatLamp(score.score, score.clear_type);

    const dryScore: DryScore<"jubeat:Single"> = {
        comment: null,
        game: "jubeat",
        importType,
        timeAchieved,
        service: "ARC Jubeat clan",
        scoreData: {
            grade,
            percent,
            score: score.score,
            hitData: {},
            hitMeta: {},
            lamp,
        },
        scoreMeta: {},
    };

    return { song, chart, dryScore };
};

/**
 * ARC has a bug where all jubeat scores are clears no matter what.
 * This function takes the score and lamp and rederives the lamp.
 */
function ResolveARCJubeatLamp(
    score: integer,
    lamp: ARCJubeatScore["clear_type"]
): Lamps["jubeat:Single"] {
    if (score === 1_000_000) {
        return "EXCELLENT";
    } else if (lamp === "FULL_COMBO") {
        return "FULL COMBO";
    } else if (score >= 700_000) {
        return "CLEAR";
    }

    return "FAILED";
}
