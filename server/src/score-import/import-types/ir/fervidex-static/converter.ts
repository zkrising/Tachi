import { FindSongOnID } from "../../../../common/database-lookup/song";
import { ConverterFunction, DryScore } from "../../../../types";
import {
    GenericCalculatePercent,
    GetGradeFromPercent,
} from "../../../framework/common/score-utils";
import {
    InternalFailure,
    InvalidScoreFailure,
    KTDataNotFoundFailure,
} from "../../../framework/score-importing/converter-failures";
import { Lamps, Grades } from "kamaitachi-common";
import { FindChartOnInGameIDVersion } from "../../../../common/database-lookup/chart";
import { FervidexStaticContext, FervidexStaticScore } from "./types";
import { FERVIDEX_LAMP_LOOKUP, SplitFervidexChartRef } from "../fervidex/converter";

export const ConverterIRFervidexStatic: ConverterFunction<
    FervidexStaticScore,
    FervidexStaticContext
> = async (data, context, importType, logger) => {
    let { difficulty, playtype } = SplitFervidexChartRef(data.chart);

    let chart = await FindChartOnInGameIDVersion(
        "iidx",
        data.song_id,
        playtype,
        difficulty,
        context.version
    );

    if (!chart) {
        throw new KTDataNotFoundFailure(
            `Could not find chart with songID ${data.song_id} (${playtype} ${difficulty})`,
            importType,
            data,
            context
        );
    }

    let song = await FindSongOnID("iidx", chart.songID);

    if (!song) {
        logger.severe(`Song ${chart.songID} (iidx) has no parent song?`);
        throw new InternalFailure(`Song ${chart.songID} (iidx) has no parent song?`);
    }

    const percent = GenericCalculatePercent("iidx", data.ex_score, chart);

    if (percent > 100) {
        throw new InvalidScoreFailure(
            `Invalid score of ${data.ex_score} for chart ${song.title} (${playtype} ${difficulty}). Resulted in percent ${percent}.`
        );
    }

    let dryScore: DryScore<"iidx:SP" | "iidx:DP"> = {
        game: "iidx",
        service: "Fervidex Static",
        comment: null,
        importType: "ir/fervidex-static",
        timeAchieved: null,
        scoreData: {
            score: data.ex_score,
            percent,
            grade: GetGradeFromPercent("iidx", percent) as Grades["iidx:SP" | "iidx:DP"],
            lamp: FERVIDEX_LAMP_LOOKUP[data.clear_type] as Lamps["iidx:SP" | "iidx:DP"],
            hitData: {},
            hitMeta: {
                bp: data.miss_count === -1 ? null : data.miss_count,
            },
        },
        scoreMeta: {},
    };

    return { song, chart, dryScore };
};
