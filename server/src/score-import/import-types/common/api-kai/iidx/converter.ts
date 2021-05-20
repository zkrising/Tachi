import { FindIIDXChartOnInGameIDVersion } from "../../../../../common/database-lookup/chart";
import { ConverterFunction, DryScore } from "../../../../../types";
import { KaiContext, KaiIIDXScore } from "../types";
import p from "prudence";
import {
    InternalFailure,
    InvalidScoreFailure,
    KTDataNotFoundFailure,
} from "../../../../framework/common/converter-failures";
import { FormatPrError } from "../../../../../common/prudence";
import { FindSongOnID } from "../../../../../common/database-lookup/song";
import {
    GenericCalculatePercent,
    GetGradeFromPercent,
} from "../../../../framework/common/score-utils";
import { Grades, Lamps } from "kamaitachi-common";

const PR_KaiIIDXScore = {
    music_id: p.isPositiveInteger,
    play_style: p.isIn("SINGLE", "DOUBLE"),
    difficulty: p.isIn("BEGINNER", "NORMAL", "HYPER", "ANOTHER", "LEGGENDARIA"),
    version_played: p.isBoundedInteger(9, 28),
    lamp: "string",
    ex_score: p.isPositiveInteger,
    miss_count: p.or(p.isPositiveInteger, p.is(-1)),
    fast_count: p.isPositiveInteger,
    slow_count: p.isPositiveInteger,
    timestamp: "string",
};

function ResolveKaiLamp(lamp: string): Lamps["iidx:SP" | "iidx:DP"] {
    switch (lamp) {
        case "FAILED":
            return "FAILED";
        case "EASY_CLEAR":
            return "EASY CLEAR";
        case "ASSIST_CLEAR":
            return "ASSIST CLEAR";
        case "CLEARED":
            return "CLEAR";
        case "HARD_CLEAR":
            return "HARD CLEAR";
        case "EX_HARD_CLEAR":
            return "EX HARD CLEAR";
        case "FULL_COMBO":
            return "FULL COMBO";
    }

    throw new InvalidScoreFailure(`Invalid lamp of ${lamp}.`);
}

export const ConvertAPIKaiIIDX: ConverterFunction<unknown, KaiContext> = async (
    data,
    context,
    importType,
    logger
) => {
    const err = p(data, PR_KaiIIDXScore, {}, { allowExcessKeys: true });

    if (err) {
        throw new InvalidScoreFailure(FormatPrError(err));
    }

    // prudence checks this above.
    const score = data as KaiIIDXScore;

    const playtype = score.play_style === "SINGLE" ? "SP" : "DP";

    const chart = await FindIIDXChartOnInGameIDVersion(
        score.music_id,
        playtype,
        score.difficulty,
        // they send integers like 25, 27 - this will convert to our versions.
        score.version_played.toString()
    );

    if (!chart) {
        throw new KTDataNotFoundFailure(
            `Could not find chart with songID ${score.music_id} (${playtype} ${score.difficulty} - Version ${score.version_played})`,
            importType,
            data,
            context
        );
    }

    const song = await FindSongOnID("iidx", chart.songID);

    if (!song) {
        logger.severe(`Song-Chart desync with song ID ${chart.songID} (iidx).`);
        throw new InternalFailure(`Song-Chart desync with song ID ${chart.songID} (iidx).`);
    }

    const percent = GenericCalculatePercent("iidx", score.ex_score, chart);

    if (percent > 100) {
        throw new InvalidScoreFailure(`Percent for score was greater than 100%.`);
    }

    const grade = GetGradeFromPercent("iidx", percent) as Grades["iidx:SP" | "iidx:DP"];

    const lamp = ResolveKaiLamp(score.lamp);

    const timeAchieved = Date.parse(score.timestamp);

    if (Number.isNaN(timeAchieved)) {
        throw new InvalidScoreFailure(
            `Invalid score date of ${score.timestamp}. Could not convert to timestamp.`
        );
    }

    const dryScore: DryScore<"iidx:SP" | "iidx:DP"> = {
        comment: null,
        game: "iidx",
        importType,
        timeAchieved,
        service: context.service,
        scoreData: {
            grade,
            percent,
            score: score.ex_score,
            lamp,
            hitData: {},
            hitMeta: {
                fast: score.fast_count,
                slow: score.slow_count,
                bp: score.miss_count === -1 ? null : score.miss_count,
            },
        },
        scoreMeta: {},
    };

    return { song, chart, dryScore };
};
