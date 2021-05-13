import { KtLogger, ParserFunctionReturnsSync } from "../../../../types";
import ScoreImportFatalError from "../../../framework/score-importing/score-import-error";
import { BatchManual, BatchManualContext, BatchManualScore } from "./types";
import p, { PrudenceSchema, ValidSchemaValue } from "prudence";
import { lamps, supportedGames, validHitData, validPlaytypes } from "kamaitachi-common/js/config";
import { Game, ImportTypes } from "kamaitachi-common";
import { ConverterBatchManual } from "./converter";
import deepmerge from "deepmerge";
import { FormatPrError } from "../../../../common/prudence";

const optNull = (v: ValidSchemaValue) => p.optional(p.nullable(v));

const BaseValidHitMeta = {
    fast: optNull(p.isPositiveInteger),
    slow: optNull(p.isPositiveInteger),
    maxCombo: optNull(p.isPositiveInteger),
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
    comment: optNull(p.isBoundedString(3, 240)),
    playtype: optNull(p.isIn(validPlaytypes[game])),
    difficulty: "*?string", // this is checked in converting instead
    // september 9th 2001 - this saves people not
    // reading the documentation.
    timeAchieved: optNull(
        (self) =>
            (typeof self === "number" && self > 1_000_000_000_000) ||
            "Expected a number greater than 1 Trillion - did you pass unix seconds instead of miliseconds?"
    ),
    hitData: optNull((self) => {
        if (typeof self !== "object" || self === null) {
            return "Not a valid object.";
        }

        for (const key in self) {
            if (!validHitData[game].includes(key)) {
                return `Invalid Key ${key}. Expected any of ${validHitData[game].join(", ")}`;
            }

            // @ts-expect-error shush
            let v = self[key];
            if ((!Number.isSafeInteger(v) || v < 0) && v !== null) {
                return `Key ${key} had an invalid value of ${v} [${typeof v}]`;
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
 * Parses an object of BATCH-MANUAL data.
 * @param object - The object to parse.
 * @param body - The request body that made this file import request.
 */
export function ParseBatchManualFromObject(
    object: unknown,
    importType: ImportTypes,
    logger: KtLogger
): ParserFunctionReturnsSync<BatchManualScore, BatchManualContext> {
    // now to perform some basic validation so we can return
    // the iterable

    if (typeof object !== "object" || object === null) {
        throw new ScoreImportFatalError(
            400,
            `Invalid BATCH-MANUAL (Not an object, recieved ${
                object === null ? "null" : typeof object
            }.)`
        );
    }

    // attempt to retrieve game
    // @ts-expect-error man.
    let possiblyGame = object?.head?.game;

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
    let err = p(object, PR_BatchManual(game));

    if (err) {
        throw new ScoreImportFatalError(400, FormatPrError(err, "Invalid BATCH-MANUAL"));
    }

    let batchManual = object as BatchManual;

    return {
        game,
        context: {
            service: batchManual.head.service,
            game,
            version: batchManual.head.version ?? null,
        },
        iterable: batchManual.body,
        ConverterFunction: ConverterBatchManual,
    };
}
