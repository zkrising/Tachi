import { config, ESDCore, Lamps, SongDocument } from "kamaitachi-common";
import { Logger } from "winston";
import { DryScore, ConverterFunction, ConverterFnReturn } from "../../../types";
import { FindChartWithPTDF } from "../../database-lookup/chart-ptdf";
import { FindSongOnTitleVersion } from "../../database-lookup/song-title";
import {
    KTDataNotFoundFailure,
    InternalFailure,
    InvalidScoreFailure,
} from "../../framework/core/converter-errors";
import ScoreImportFatalError from "../../framework/core/score-import-error";
import { GetGradeFromPercent } from "../../framework/core/score-utils";
import { EamusementScoreData, IIDXEamusementCSVContext, IIDXEamusementCSVData } from "./types";

export interface DataTest {
    foo: string;
}

const EAMUSEMENT_LAMP_RESOLVER: Map<string, Lamps["iidx:SP" | "iidx:DP"]> = new Map([
    ["NO PLAY", "NO PLAY"],
    ["FULLCOMBO CLEAR", "FULL COMBO"],
    ["EX HARD CLEAR", "EX HARD CLEAR"],
    ["HARD CLEAR", "HARD CLEAR"],
    ["CLEAR", "CLEAR"],
    ["EASY CLEAR", "EASY CLEAR"],
    ["ASSIST CLEAR", "ASSIST CLEAR"],
]);

async function EamScoreConverter(
    eamScore: EamusementScoreData,
    ktchiSong: SongDocument,
    context: IIDXEamusementCSVContext,
    data: IIDXEamusementCSVData,
    logger: Logger
) {
    const HUMANISED_SONG_TITLE = `${ktchiSong.title} (${context.playtype} ${eamScore.difficulty})`;
    if (!eamScore.level) {
        // charts that dont exist in the format have a level of 0
        return null;
    }

    if (eamScore.exscore === 0) {
        // skip scores with an exscore of 0
        // This also skips things like score resets.
        return null;
    }

    let ktchiChart = await FindChartWithPTDF(
        "iidx",
        ktchiSong.id,
        context.playtype,
        eamScore.difficulty
    );

    if (!ktchiChart) {
        throw new KTDataNotFoundFailure(
            `${HUMANISED_SONG_TITLE}`,
            "csv:eamusement-iidx",
            data,
            context
        );
    }

    if (typeof eamScore.exscore !== "number") {
        throw new InvalidScoreFailure(
            `${HUMANISED_SONG_TITLE} - Invalid EX Score of ${eamScore.exscore} (Was not a number?).`
        );
    } else if (!Number.isSafeInteger(eamScore.exscore)) {
        throw new InvalidScoreFailure(
            `${HUMANISED_SONG_TITLE} - Invalid EX Score of ${eamScore.exscore} (Not an integer?).`
        );
    } else if (eamScore.exscore < 0) {
        throw new InvalidScoreFailure(
            `${HUMANISED_SONG_TITLE} - Invalid EX Score of ${eamScore.exscore} (Not an integer?).`
        );
    } else if (eamScore.exscore > ktchiChart.notedata.notecount) {
        throw new InvalidScoreFailure(
            `${HUMANISED_SONG_TITLE} - Invalid EX Score of ${eamScore.exscore} (Was greater than chart notecount of ${ktchiChart.notedata.notecount}).`
        );
    }

    const lamp = EAMUSEMENT_LAMP_RESOLVER.get(eamScore.lamp);

    if (!lamp) {
        logger.info(`Invalid lamp of ${eamScore.lamp} provided.`);
        throw new InvalidScoreFailure(
            `${HUMANISED_SONG_TITLE} - Invalid Lamp of ${eamScore.lamp}.`
        );
    }

    const percent = (100 * eamScore.exscore) / ktchiChart.notedata.notecount;
    const grade = GetGradeFromPercent<"iidx:SP" | "iidx:DP">("iidx", percent);

    if (!grade) {
        throw new InternalFailure(
            `${HUMANISED_SONG_TITLE} - Could not resolve ${percent} into a grade?`
        );
    }

    let esd = 200;

    // esd cannot estimate things below this level of accuracy, so only actually calculate it here
    if (percent > 0.1) {
        esd = ESDCore.CalculateESD(config.judgementWindows.iidx[context.playtype], percent);
    }

    // Now we need to figure out the timestamp for this score.
    // Under, well, normal circumstances, we could figure this out quite trivially
    // But e-amusement provides us the timestamp for the *song*, not the score
    //
    // We're going to actually ignore this. Initial drafts of this assumed we could skip the
    // "epochs" (when a score reset on eamusement happened), but it turns out those are
    // generated when the user triggers a score migration, NOT (as initially thought) when
    // KONAMI decides.

    let timestamp = Date.parse(data.timestamp);

    let dryScore: DryScore<"iidx:SP" | "iidx:DP"> = {
        service: context.serviceOrigin,
        comment: null,
        game: "iidx",
        importType: "csv:eamusement-iidx",
        scoreData: {
            score: eamScore.exscore,
            lamp,
            hitData: {
                pgreat: eamScore.pgreat,
                great: eamScore.great,
            },
            hitMeta: {},
            percent,
            grade,
            esd,
        },
        scoreMeta: {},
        timeAchieved: timestamp,
    };

    if (typeof eamScore.bp === "number") {
        if (!Number.isInteger(eamScore.bp)) {
            throw new InvalidScoreFailure(`${HUMANISED_SONG_TITLE} - Invalid BP of ${eamScore.bp}`);
        }
        dryScore.scoreData.hitMeta.bp = eamScore.bp;
    } else if (eamScore.bp === "---") {
        logger.verbose(
            `Skipped assigning BP for score as it had expected null value of ${eamScore.bp}.`
        );
    } else {
        logger.warn(`Skipped assigning BP for score. Had unexpected value of ${eamScore.bp}.`);
    }

    return { ktchiChart, dryScore };
}

/**
 * Thin wrapper around EamScoreConverter to ensure it returns the expected values
 * @param eamScore - The eamusement score data to convert.
 * @param song - The song this score is for.
 * @param context - Context the converter may need.
 * @param data - The parent data the eamScore derives from.
 * @returns ConverterFnReturn
 */
async function EamScoreConverterWrapper(
    eamScore: EamusementScoreData,
    song: SongDocument,
    context: IIDXEamusementCSVContext,
    data: IIDXEamusementCSVData,
    logger: Logger
) {
    try {
        let results = await EamScoreConverter(eamScore, song!, context, data, logger);

        if (!results) {
            return null;
        }

        return {
            song,
            chart: results.ktchiChart,
            dryScore: results.dryScore,
        };
    } catch (err) {
        if (
            err instanceof KTDataNotFoundFailure ||
            err instanceof InternalFailure ||
            err instanceof InvalidScoreFailure
        ) {
            return err;
        } else if (err instanceof ScoreImportFatalError) {
            throw err; // throw it all the way up.
        } else {
            logger.error(`Unknown error: `, { err });
            return new InternalFailure("An unknown internal failure has occured.");
        }
    }
}

const ConverterFn: ConverterFunction<IIDXEamusementCSVData, IIDXEamusementCSVContext> = async (
    data,
    context,
    logger: Logger
): Promise<ConverterFnReturn[]> => {
    let ktchiSong = await FindSongOnTitleVersion("iidx", data.title, context.importVersion);

    if (!ktchiSong) {
        logger.warn(`Could not find song for ${data.title}.`);
        throw new KTDataNotFoundFailure(data.title, "csv:eamusement-iidx", data, context);
    }

    // ts thinks ktchiSong might be null. It's not, though!
    let results = await Promise.all(
        data.scores.map((e) => EamScoreConverterWrapper(e, ktchiSong!, context, data, logger))
    );

    return results;
};

export default ConverterFn;
