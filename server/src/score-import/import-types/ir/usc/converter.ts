import { USCClientScore } from "../../../../api/ir/usc/common";
import { FindSongOnID } from "../../../../common/database-lookup/song";
import { ConverterFunction, DryScore, KtLogger } from "../../../../types";
import { InternalFailure } from "../../../framework/common/converter-failures";
import { GenericGetGradeAndPercent } from "../../../framework/common/score-utils";
import { IRUSCContext } from "./types";
import { Lamps } from "kamaitachi-common";

function DeriveNoteMod(data: USCClientScore): "NORMAL" | "MIRROR" | "RANDOM" | "MIR-RAN" {
    if (data.options.mirror && data.options.random) {
        return "MIR-RAN";
    } else if (data.options.mirror) {
        return "MIRROR";
    } else if (data.options.random) {
        return "RANDOM";
    }

    return "NORMAL";
}

function DeriveLamp(scoreDoc: USCClientScore, logger: KtLogger): Lamps["usc:Single"] {
    if (scoreDoc.score === 10_000_000) {
        return "PERFECT ULTIMATE CHAIN";
    } else if (scoreDoc.error === 0) {
        return "ULTIMATE CHAIN";
    } else if (scoreDoc.options.gaugeType === 0) {
        return scoreDoc.gauge >= 70 ? "CLEAR" : "FAILED";
    } else if (scoreDoc.options.gaugeType === 1) {
        return scoreDoc.gauge > 0 ? "EXCESSIVE CLEAR" : "FAILED";
    }

    logger.error(`Could not derive Lamp from Score Document`, { scoreDoc });
    throw new InternalFailure(`Could not derive Lamp from Score Document`);
}

export const ConverterIRUSC: ConverterFunction<USCClientScore, IRUSCContext> = async (
    data,
    context,
    importType,
    logger
) => {
    const song = await FindSongOnID("usc", context.chart.songID);

    if (!song) {
        logger.severe(`Song-Chart desync on USCIR ${context.chart.songID}.`);
        throw new InternalFailure(`Song-Chart desync on USCIR ${context.chart.songID}.`);
    }

    const { grade, percent } = GenericGetGradeAndPercent("usc", data.score, context.chart);

    const dryScore: DryScore<"usc:Single"> = {
        comment: null,
        game: "usc",
        importType,
        timeAchieved: Date.now(),
        service: "USC-IR",
        scoreData: {
            grade,
            percent,
            score: data.score,
            lamp: DeriveLamp(data, logger),
            hitData: {
                critical: data.crit,
                near: data.near,
                miss: data.error,
            },
            hitMeta: {
                gauge: data.gauge,
            },
        },
        scoreMeta: {
            gaugeMod: data.options.gaugeOpt === 0 ? "NORMAL" : "HARD",
            noteMod: DeriveNoteMod(data),
        },
    };

    return { chart: context.chart, song, dryScore };
};
