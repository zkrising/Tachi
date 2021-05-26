import { FindChartOnSHA256 } from "../../../../../utils/queries/charts";
import { FindSongOnID } from "../../../../../utils/queries/songs";
import { InternalFailure } from "../../../framework/common/converter-failures";
import { GenericGetGradeAndPercent } from "../../../framework/common/score-utils";
import { DryScore } from "../../../framework/common/types";
import { ConverterFunction } from "../../common/types";
import { BeatorajaContext, BeatorajaScore } from "./types";
import { ChartDocument } from "kamaitachi-common";

const LAMP_LOOKUP = {
    NoPlay: "NO PLAY",
    Failed: "FAILED",
    LightAssistEasy: "ASSIST CLEAR",
    Easy: "EASY CLEAR",
    Normal: "CLEAR",
    Hard: "HARD CLEAR",
    ExHard: "EX HARD CLEAR",
    FullCombo: "FULL COMBO",
    Perfect: "FULL COMBO",
} as const;

const RANDOM_LOOKUP = {
    0: "NONRAN",
    1: "MIRROR",
    2: "RANDOM",
    3: "R-RANDOM",
    4: "S-RANDOM",
} as const;

export const ConverterIRBeatoraja: ConverterFunction<BeatorajaScore, BeatorajaContext> = async (
    data,
    context,
    importType,
    logger
) => {
    const chart = (await FindChartOnSHA256("bms", data.sha256)) as ChartDocument<
        "bms:7K" | "bms:14K"
    >;

    if (!chart) {
        // @todo #141 Import charts into the Kamaitachi Database if the chart
        // doesn't exist.
        throw new Error("unimplemented");
    }

    const song = await FindSongOnID("bms", chart.songID);

    if (!song) {
        logger.severe(`Song-Chart Desync with BMS ${chart.chartID}.`);
        throw new InternalFailure(`Song-Chart Desync with BMS ${chart.chartID}.`);
    }

    // if CN mode
    if (data.lntype === 1) {
        // Divide the EX score by the CN note count, then multiply it by the LN
        // notecount. This converts CN EXScores to LN EXScores by routing
        // through percent.
        data.exscore = Math.floor((data.exscore / context.chart.notes) * chart.data.notecount);
    }

    const { grade, percent } = GenericGetGradeAndPercent("bms", data.exscore, chart);

    const hitMeta: DryScore<"bms:7K" | "bms:14K">["scoreData"]["hitMeta"] = {
        bp: data.minbp === -1 ? null : data.minbp,
        gauge: data.gauge === -1 ? null : data.gauge,
    };

    let hitData: DryScore<"bms:7K" | "bms:14K">["scoreData"]["hitData"] = {};

    // if NOT CN mode we can assign judgements properly
    if (data.lntype === 0) {
        for (const k of [
            "ebd",
            "lbd",
            "egd",
            "lgd",
            "egr",
            "lgr",
            "epg",
            "lpg",
            "epr",
            "lpr",
        ] as const) {
            hitMeta[k] = data[k];
        }

        hitMeta.epr! += data.ems;
        hitMeta.lpr! += data.lms;

        hitData = {
            pgreat: data.epg + data.lpg,
            great: data.egr + data.lgr,
            good: data.egd + data.lgd,
            bad: data.ebd + data.lbd,
            poor: data.epr + data.lpr + data.ems + data.lms,
        };
    }

    const lamp = LAMP_LOOKUP[data.clear];

    const dryScore: DryScore<"bms:7K" | "bms:14K"> = {
        comment: null,
        game: "bms",
        importType,
        scoreData: {
            grade,
            percent,
            score: data.exscore,
            lamp,
            hitMeta,
            hitData,
        },
        scoreMeta: {
            client: context.client,
            inputDevice: data.deviceType,
            random: RANDOM_LOOKUP[data.option] ?? null,
        },
        timeAchieved: Date.now(),
        service: "Beatoraja IR",
    };

    return { song, chart, dryScore };
};
