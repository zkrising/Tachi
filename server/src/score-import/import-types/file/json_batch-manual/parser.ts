import { KtLogger, ParserFunctionReturnsSync } from "../../../../types";
import ScoreImportFatalError from "../../../framework/score-importing/score-import-error";
import { BatchManual, BatchManualContext, BatchManualScore } from "./types";
import p, { PrudenceSchema, ValidSchemaValue } from "prudence";
import {
    lamps,
    supportedGames,
    validHitData,
    validHitMeta,
    validPlaytypes,
} from "kamaitachi-common/js/config";
import { Game } from "kamaitachi-common";
import ConverterFn from "./converter";
import deepmerge from "deepmerge";

const optNull = (v: ValidSchemaValue) => p.optional(p.nullable(v));

const BaseValidHitMeta = {
    fast: p.isPositiveInteger,
    slow: p.isPositiveInteger,
    maxCombo: p.isPositiveInteger,
};

const PR_HitMeta = (game: Game): PrudenceSchema => {
    if (game === "iidx") {
        return {
            bp: optNull(p.isPositiveInteger),
            gauge: optNull(p.isBoundedInteger(0, 100)),
            gaugeHistory: optNull([p.isBoundedInteger(0, 100)]),
            comboBreak: optNull(p.isPositiveInteger),
        };
    } else if (game === "popn" || game === "sdvx" || game === "usc") {
        return {
            gauge: optNull(p.isBoundedInteger(0, 100)),
        };
    } else if (game === "bms") {
        return {
            bp: optNull(p.isPositiveInteger),
            gauge: optNull(p.isBoundedInteger(0, 100)),
            lbd: optNull(p.isPositiveInteger),
            ebd: optNull(p.isPositiveInteger),
            lpr: optNull(p.isPositiveInteger),
            epr: optNull(p.isPositiveInteger),
            lgd: optNull(p.isPositiveInteger),
            egd: optNull(p.isPositiveInteger),
            lgr: optNull(p.isPositiveInteger),
            egr: optNull(p.isPositiveInteger),
            lpg: optNull(p.isPositiveInteger),
            epg: optNull(p.isPositiveInteger),
            diedAt: optNull(p.isPositiveInteger),
        };
    }

    return {};
};

const PR_BatchManualScore = (game: Game): PrudenceSchema => ({
    score: "number",
    lamp: p.isIn(lamps[game]),
    matchType: p.isIn(
        "songTitle",
        "ddrSongHash",
        "kamaitachiSongID",
        "bmsChartHash",
        "title",
        "songHash",
        "songID",
        "hash"
    ),
    identifier: "string",
    playtype: optNull(p.isIn(validPlaytypes[game])),
    difficulty: "*?string", // this is checked in converting instead
    // september 9th 2001 - this saves people not
    // reading the documentation.
    timeAchieved: optNull(p.gt(1_000_000_000_000)),
    hitData: optNull((self) => {
        if (typeof self !== "object" || self === null) {
            return "Not a valid object.";
        }

        for (const key in self) {
            if (!validHitData[game].includes(key)) {
                return `Invalid Key ${key}. Expected any of ${validHitData[game].toString()}`;
            }

            // @ts-expect-error shush
            let v = self[key];
            if (!Number.isSafeInteger(v)) {
                return `Key ${key} had an invalid value of ${v}.`;
            }
        }

        return true;
    }),
    hitMeta: optNull(
        (deepmerge(BaseValidHitMeta, PR_HitMeta(game)) as unknown) as ValidSchemaValue
    ),
    // scoreMeta: @todo
    // more game specific props, maybe?
});

const PR_BatchManual = (game: Game): PrudenceSchema => ({
    head: {
        service: p.isBoundedString(3, 15),
        game: p.isIn(supportedGames),
        version: "*?string",
    },
    body: [PR_BatchManualScore(game)],
});

/**
 * Parses a buffer of BATCH-MANUAL data.
 * @param fileData - The buffer to parse.
 * @param body - The request body that made this file import request.
 */
function ParseBatchManual(
    fileData: Express.Multer.File,
    body: Record<string, unknown>,
    logger: KtLogger
): ParserFunctionReturnsSync<BatchManualScore, BatchManualContext> {
    let jsonData: unknown;

    try {
        jsonData = JSON.parse(fileData.buffer.toString("utf-8"));
    } catch (err) {
        throw new ScoreImportFatalError(
            400,
            `Invalid JSON. (${err?.message ?? "No Error Message Available."})`
        );
    }

    // now to perform some basic validation so we can return
    // the iterable

    if (typeof jsonData !== "object" || jsonData === null) {
        throw new ScoreImportFatalError(
            400,
            `Invalid BATCH-MANUAL (Not an object, recieved ${
                jsonData === null ? "null" : typeof jsonData
            }.)`
        );
    }

    // attempt to retrieve game
    // @ts-expect-error man.
    let possiblyGame = jsonData?.head?.game;

    if (!possiblyGame) {
        throw new ScoreImportFatalError(
            400,
            `Could not retrieve head.game - is this valid BATCH-MANUAL?`
        );
    }

    if (!supportedGames.includes(possiblyGame)) {
        throw new ScoreImportFatalError(
            400,
            `Invalid game ${possiblyGame} - expected any of ${supportedGames.join(", ")}`
        );
    }

    let game: Game = possiblyGame;

    // now that we have the game, we can validate this against
    // the prudence schema for batch-manual.
    // This mostly works as a sanity check, and doesn't
    // check things like whether a score is > 100%
    // or something.
    let err = p(jsonData, PR_BatchManual(game));

    if (err) {
        throw new ScoreImportFatalError(
            400,
            `Invalid BATCH-MANUAL (${err.keychain} | ${err.message} | Received ${err.userVal})`
        );
    }

    let batchManual = jsonData as BatchManual;

    return {
        game,
        context: {
            service: batchManual.head.service,
            game,
            version: batchManual.head.version ?? null,
        },
        iterable: batchManual.body,
        ConverterFunction: ConverterFn,
    };
}

export default ParseBatchManual;
