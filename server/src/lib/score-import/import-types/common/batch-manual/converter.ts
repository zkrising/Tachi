import { BatchManualContext, BatchManualScore } from "./types";
import { AnyChartDocument, AnySongDocument, ImportTypes } from "tachi-common";
import {
    InternalFailure,
    InvalidScoreFailure,
    KTDataNotFoundFailure,
} from "../../../framework/common/converter-failures";
import { FindSongOnID, FindSongOnTitleInsensitive } from "../../../../../utils/queries/songs";
import {
    FindBMSChartOnHash,
    FindChartWithPTDF,
    FindChartWithPTDFVersion,
    FindDDRChartOnSongHash,
} from "../../../../../utils/queries/charts";
import {
    AssertStrAsDifficulty,
    AssertStrAsPositiveInt,
} from "../../../framework/common/string-asserts";
import { GenericGetGradeAndPercent } from "../../../framework/common/score-utils";
import { KtLogger } from "../../../../logger/logger";
import { DryScore } from "../../../framework/common/types";
import { ConverterFunction } from "../types";

/**
 * Creates a ConverterFn for the BatchManualScore format. This curries
 * the importType into the function, so the right failures can be
 * returned.
 * @returns A BatchManualScore Converter.
 */
export const ConverterBatchManual: ConverterFunction<BatchManualScore, BatchManualContext> = async (
    data,
    context,
    importType,
    logger
) => {
    const game = context.game;

    const { song, chart } = await ResolveMatchTypeToKTData(data, context, importType, logger);

    const { percent, grade } = GenericGetGradeAndPercent(context.game, data.score, chart);

    let service = context.service;

    if (importType === "ir/direct-manual") {
        service += " (DIRECT-MANUAL)";
    } else if (importType === "file/batch-manual") {
        service += " (BATCH-MANUAL)";
    }

    const dryScore: DryScore = {
        game: game,
        service,
        comment: data.comment ?? null,
        importType,
        timeAchieved: data.timeAchieved ?? null,
        scoreData: {
            lamp: data.lamp,
            score: data.score,
            grade,
            percent,
            hitData: data.hitData ?? {},
            hitMeta: data.hitMeta ?? {},
        },
        scoreMeta: {}, // @todo #74
    };

    return {
        chart,
        song,
        dryScore,
    };
};

export async function ResolveMatchTypeToKTData(
    data: BatchManualScore,
    context: BatchManualContext,
    importType: ImportTypes,
    logger: KtLogger
): Promise<{ song: AnySongDocument; chart: AnyChartDocument }> {
    const game = context.game;

    if (data.matchType === "bmsChartHash" || data.matchType === "hash") {
        if (game !== "bms") {
            throw new InvalidScoreFailure(`Cannot use bmsChartHash lookup on ${game}.`);
        }

        const chart = await FindBMSChartOnHash(data.identifier);

        if (!chart) {
            throw new KTDataNotFoundFailure(
                `Cannot find chart for hash ${data.identifier}.`,
                importType,
                data,
                context
            );
        }

        const song = await FindSongOnID(game, chart.songID);

        if (!song) {
            logger.severe(`BMS songID ${chart.songID} has charts but no parent song.`);
            throw new InternalFailure(`BMS songID ${chart.songID} has charts but no parent song.`);
        }

        return { chart, song };
    } else if (data.matchType === "ddrSongHash" || data.matchType === "songHash") {
        if (game !== "ddr") {
            throw new InvalidScoreFailure(`Cannot use ddrSongHash lookup on ${game}.`);
        }

        if (!data.difficulty) {
            throw new InvalidScoreFailure(
                `Missing 'difficulty' field, but is needed for ddrSongHash lookup.`
            );
        }

        if (!data.playtype) {
            throw new InvalidScoreFailure(
                `Missing 'playtype' field, but is needed for ddrSongHash lookup.`
            );
        }

        const difficulty = AssertStrAsDifficulty(data.difficulty, game, data.playtype);

        const chart = await FindDDRChartOnSongHash(data.identifier, data.playtype, difficulty);

        if (!chart) {
            throw new KTDataNotFoundFailure(
                `Cannot find chart for songHash ${data.identifier} (${data.playtype} ${difficulty}).`,
                importType,
                data,
                context
            );
        }

        const song = await FindSongOnID(game, chart.songID);

        if (!song) {
            logger.severe(`DDR songID ${chart.songID} has charts but no parent song.`);
            throw new InternalFailure(`DDR songID ${chart.songID} has charts but no parent song.`);
        }

        return { song, chart };
    } else if (data.matchType === "kamaitachiSongID" || data.matchType === "songID") {
        const songID = AssertStrAsPositiveInt(
            data.identifier,
            "Invalid songID - must be a stringified positive integer."
        );

        const song = await FindSongOnID(game, songID);

        if (!song) {
            throw new KTDataNotFoundFailure(
                `Cannot find song with songID ${data.identifier}.`,
                importType,
                data,
                context
            );
        }

        const chart = await ResolveChartFromSong(song, data, context, importType);

        return { song, chart };
    } else if (data.matchType === "songTitle" || data.matchType === "title") {
        const song = await FindSongOnTitleInsensitive(game, data.identifier);

        if (!song) {
            throw new KTDataNotFoundFailure(
                `Cannot find song with title ${data.identifier}.`,
                importType,
                data,
                context
            );
        }

        const chart = await ResolveChartFromSong(song, data, context, importType);

        return { song, chart };
    }

    logger.error(
        `Invalid matchType ${data.matchType} ended up in conversion - should have been rejected by prudence?`
    );
    // really, this could be a larger error. - it's an internal failure because prudence should reject this.
    throw new InvalidScoreFailure(`Invalid matchType ${data.matchType}.`);
}

export async function ResolveChartFromSong(
    song: AnySongDocument,
    data: BatchManualScore,
    context: BatchManualContext,
    importType: ImportTypes
) {
    const game = context.game;

    if (!data.difficulty) {
        throw new InvalidScoreFailure(
            `Missing 'difficulty' field, but was necessary for this lookup.`
        );
    }

    if (!data.playtype) {
        throw new InvalidScoreFailure(
            `Missing 'playtype' field, but was necessary for this lookup.`
        );
    }

    const difficulty = AssertStrAsDifficulty(data.difficulty, game, data.playtype);

    let chart;

    if (context.version) {
        chart = await FindChartWithPTDFVersion(
            game,
            song.id,
            data.playtype,
            difficulty,
            context.version
        );
    } else {
        chart = await FindChartWithPTDF(game, song.id, data.playtype, difficulty);
    }

    if (!chart) {
        throw new KTDataNotFoundFailure(
            `Cannot find chart for ${song.title} (${data.playtype} ${difficulty})`,
            importType,
            data,
            context
        );
    }

    return chart;
}
