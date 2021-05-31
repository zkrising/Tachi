import { Lamps, ChartDocument } from "kamaitachi-common";
import { FindChartWithPTDFVersion } from "../../../../../utils/queries/charts";
import { FindSongOnTitle } from "../../../../../utils/queries/songs";
import {
    KTDataNotFoundFailure,
    InvalidScoreFailure,
    SkipScoreFailure,
} from "../../../framework/common/converter-failures";
import {
    GenericGetGradeAndPercent,
    ParseDateFromString,
} from "../../../framework/common/score-utils";
import { AssertStrAsPositiveInt } from "../../../framework/common/string-asserts";
import { IIDXEamusementCSVContext, IIDXEamusementCSVData } from "./types";
import { DryScore } from "../../../framework/common/types";
import { ConverterFunction } from "../types";

const EAMUSEMENT_LAMP_RESOLVER: Map<string, Lamps["iidx:SP" | "iidx:DP"]> = new Map([
    ["NO PLAY", "NO PLAY"],
    ["FAILED", "FAILED"],
    ["FULLCOMBO CLEAR", "FULL COMBO"],
    ["EX HARD CLEAR", "EX HARD CLEAR"],
    ["HARD CLEAR", "HARD CLEAR"],
    ["CLEAR", "CLEAR"],
    ["EASY CLEAR", "EASY CLEAR"],
    ["ASSIST CLEAR", "ASSIST CLEAR"],
]);

const NINE_HOURS = 1000 * 60 * 60 * 9;

const ConvertEamIIDXCSV: ConverterFunction<
    IIDXEamusementCSVData,
    IIDXEamusementCSVContext
> = async (data, context, importType, logger) => {
    let isLegacyLeggendaria = false;

    // if pre-HV, leggendarias were stored in a wacky form.
    if (!context.hasBeginnerAndLegg) {
        // hack fix for legacy LEGGENDARIA titles
        if (data.title.match(/(†|†LEGGENDARIA)$/u)) {
            data.title = data.title.replace(/(†|†LEGGENDARIA)$/u, "").trimEnd();
            isLegacyLeggendaria = true;
        }
    }

    const ktchiSong = await FindSongOnTitle("iidx", data.title);

    if (!ktchiSong) {
        throw new KTDataNotFoundFailure(
            `Could not find song for ${data.title}.`,
            importType,
            data,
            context
        );
    }

    const eamScore = data.score;

    const HUMANISED_CHART_TITLE = `${ktchiSong.title} (${context.playtype} ${eamScore.difficulty} [v${context.importVersion}])`;

    if (!eamScore.level || eamScore.level === "0") {
        // charts that dont exist in the format have a level of 0
        throw new SkipScoreFailure("Chart has a level of 0.");
    }

    if (isLegacyLeggendaria) {
        eamScore.difficulty = "LEGGENDARIA";
    }

    if (eamScore.exscore === "0") {
        // skip scores with an exscore of 0
        // This also skips things like score resets.
        throw new SkipScoreFailure("Score has an exscore of 0.");
    }

    const ktchiChart = (await FindChartWithPTDFVersion(
        "iidx",
        ktchiSong.id,
        context.playtype,
        eamScore.difficulty,
        context.importVersion
    )) as ChartDocument<"iidx:SP" | "iidx:DP">;

    if (!ktchiChart) {
        throw new KTDataNotFoundFailure(
            `Could not find chart for ${HUMANISED_CHART_TITLE}`,
            "file/eamusement-iidx-csv",
            data,
            context
        );
    }

    const exscore = AssertStrAsPositiveInt(
        eamScore.exscore,
        `${HUMANISED_CHART_TITLE} - Invalid EX score of ${eamScore.exscore}`
    );

    const MAX_EX = ktchiChart.data.notecount * 2;

    if (exscore > MAX_EX) {
        throw new InvalidScoreFailure(
            `${HUMANISED_CHART_TITLE} - Invalid EX Score of ${eamScore.exscore} (Was greater than max chart ex of ${MAX_EX}).`
        );
    }

    const pgreat = AssertStrAsPositiveInt(
        eamScore.pgreat,
        `${HUMANISED_CHART_TITLE} - Invalid PGreats of ${eamScore.pgreat}`
    );

    const great = AssertStrAsPositiveInt(
        eamScore.great,
        `${HUMANISED_CHART_TITLE} - Invalid Greats of ${eamScore.pgreat}`
    );

    if (pgreat * 2 + great !== exscore) {
        throw new InvalidScoreFailure(
            `${HUMANISED_CHART_TITLE} - PGreats * 2 + Greats did not equal EXScore (${pgreat} * 2 + ${great} != ${exscore}).`
        );
    }

    const lamp = EAMUSEMENT_LAMP_RESOLVER.get(eamScore.lamp);

    if (!lamp) {
        logger.info(`Invalid lamp of ${eamScore.lamp} provided.`);
        throw new InvalidScoreFailure(
            `${HUMANISED_CHART_TITLE} - Invalid Lamp of ${eamScore.lamp}.`
        );
    }

    const { percent, grade } = GenericGetGradeAndPercent("iidx", exscore, ktchiChart);

    const timestamp = ParseDateFromString(data.timestamp);

    const dryScore: DryScore<"iidx:SP" | "iidx:DP"> = {
        service: context.service,
        comment: null,
        game: "iidx",
        importType,
        scoreData: {
            score: exscore,
            lamp,
            hitData: {
                pgreat,
                great,
            },
            hitMeta: {},
            percent,
            grade,
        },
        scoreMeta: {},
        // japan is gmt+9
        timeAchieved: timestamp ? timestamp - NINE_HOURS : null,
    };

    const numBP = Number(eamScore.bp);

    if (!Number.isNaN(numBP)) {
        if (!Number.isInteger(numBP) || numBP < 0 || numBP > 9999) {
            throw new InvalidScoreFailure(
                `${HUMANISED_CHART_TITLE} - Invalid BP of ${eamScore.bp}.`
            );
        }
        dryScore.scoreData.hitMeta.bp = numBP;
    } else if (eamScore.bp === "---") {
        logger.debug(
            `Skipped assigning BP for score as it had expected null value of ${eamScore.bp}.`
        );
    } else {
        logger.info(`Skipped assigning BP for score. Had unexpected value of ${eamScore.bp}.`);
    }

    // ts thinks ktchiSong might be null. It's not, though!
    return { chart: ktchiChart, dryScore, song: ktchiSong };
};

export default ConvertEamIIDXCSV;
