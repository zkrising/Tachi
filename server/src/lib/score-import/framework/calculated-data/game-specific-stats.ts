import { AnyChartDocument, ESDCore, integer, Grades, Lamps } from "kamaitachi-common";
import db from "../../../../external/mongo/db";
import { KtLogger } from "../../../logger/logger";
import { DryScore } from "../common/types";

/**
 * Calculates the in-game CHUNITHM rating for a score.
 */
export function CalculateCHUNITHMRating(dryScore: DryScore, chartData: AnyChartDocument) {
    const score = dryScore.scoreData.score;
    const levelBase = chartData.levelNum * 100;

    let val = 0;

    if (score >= 1_007_500) {
        val = levelBase + 200;
    } else if (score >= 1_005_000) {
        val = levelBase + 150 + ((score - 1_005_000) * 10) / 500;
    } else if (score >= 1_000_000) {
        val = levelBase + 100 + ((score - 1_000_000) * 5) / 100;
    } else if (score >= 975_000) {
        val = levelBase + ((score - 975_000) * 2) / 500;
    } else if (score >= 925_000) {
        val = levelBase - 300 + ((score - 925_000) * 3) / 500;
    } else if (score >= 900_000) {
        val = levelBase - 500 + ((score - 900_000) * 4) / 500;
    } else if (score >= 800_000) {
        val = (levelBase - 500) / 2 + ((score - 800_000) * ((levelBase - 500) / 2)) / 100_000;
    }

    return Math.max(Math.floor(val) / 100, 0);
}

/**
 * Calculates the in-game GITADORA rating for a score.
 */
export function CalculateGITADORARating(dryScore: DryScore, chartData: AnyChartDocument) {
    const trueRating = (dryScore.scoreData.percent / 100) * chartData.levelNum * 20;
    const flooredRating = Math.floor(trueRating * 100) / 100;
    return flooredRating;
}

/**
 * Calculates the PikaGreatFunction, used in BPI. I have no idea what this does.
 * @returns
 */
function BPIPikaGreatFn(score: integer, max: integer) {
    return score === max ? max * 0.8 : 1 + (score / max - 0.5) / (1 - score / max);
}

/**
 * Oh boy.
 *
 * Calculates the "Beat Performance Index" of an IIDX score. This algorithm has many issues,
 * but is a direct port of Poyashi's implementation for consistencies sake.
 * https://github.com/potakusan/iidx_score_manager/blob/f21ba6b85fcc0bf8b7ca888fa2239a3951a9c9c2/src/components/bpi/index.tsx#L120
 *
 * @param kaidenEx The kaiden average EX score.
 * @param wrEx The world record's EX score.
 * @param yourEx Your EX score.
 * @param max The maximum amount of EX achievable on this chart.
 * @param powCoef What power the BPI should be raised to. This is arbitrary, and assigned on a per-song basis. Defaults to 1.175.
 * @returns A number between -15 and 100. Unless your score is better than the world record, in which case
 * returns can be above 100.
 */
export function CalculateBPI(
    kaidenEx: integer,
    wrEx: integer,
    yourEx: integer,
    max: integer,
    pc: number | null
) {
    const powCoef = pc ?? 1.175;
    const yourPGF = BPIPikaGreatFn(yourEx, max);
    const kaidenPGF = BPIPikaGreatFn(kaidenEx, max);
    const wrPGF = BPIPikaGreatFn(wrEx, max);

    // no idea what these var names are
    const _s_ = yourPGF / kaidenPGF,
        _z_ = wrPGF / kaidenPGF;

    const isBetterThanKavg = yourEx >= kaidenEx;

    // this line of code isn't mine, and that's why it's *really* bad here.
    return Math.max(
        -15,
        Math.round(
            (isBetterThanKavg ? 100 : -100) *
                Math.pow(
                    (isBetterThanKavg ? Math.log(_s_) : -Math.log(_s_)) / Math.log(_z_),
                    powCoef
                ) *
                100
        ) / 100
    );
}

/**
 * Calculates the percent of Kaidens you are ahead of with this score.
 * @returns Null, if this chart has no kaidens, a percent between 0 and 100, if there are.
 */
export async function KaidenPercentile(scoreObj: DryScore, chartData: AnyChartDocument) {
    const scoreCount = await db["iidx-eam-scores"].count({
        chartID: chartData.chartID,
    });

    if (!scoreCount) {
        return null;
    }

    const worseScores = await db["iidx-eam-scores"].count({
        chartID: chartData.chartID,
        score: { $lt: scoreObj.scoreData.score },
    });

    return (100 * worseScores) / scoreCount;
}

/**
 * An experimental statistic for determining how good a score is versus the Kaiden Average
 * For those who know what ESDC is (me), this is just ESDC(kesd, your esd).
 */
export function CalculateKESDC(kaidenESD: number | null, yourESD: number) {
    if (!kaidenESD) {
        return null;
    }
    return ESDCore.ESDCompare(kaidenESD, yourESD);
}

/**
 * Calculate Marvelous Full Combo Points. This algorithm
 * is used in LIFE4, and described here:
 * https://life4ddr.com/requirements/#mfcpoints
 * @returns Null if this score was not eligible, a number otherwise.
 */
export function CalculateMFCP(dryScore: DryScore, chartData: AnyChartDocument, logger: KtLogger) {
    if (dryScore.scoreData.lamp !== "MARVELOUS FULL COMBO") {
        return null;
    }

    // Beginner and BASIC scores are explicitly excluded.
    if (chartData.difficulty === "BEGINNER" || chartData.difficulty === "BASIC") {
        return null;
    }

    if (chartData.levelNum < 8) {
        return null;
    } else if (chartData.levelNum <= 10) {
        return 1;
    } else if (chartData.levelNum <= 12) {
        return 2;
    } else if (chartData.levelNum === 13) {
        return 4;
    } else if (chartData.levelNum === 14) {
        return 8;
    } else if (chartData.levelNum === 15) {
        return 15;
    } else if (chartData.levelNum >= 16) {
        return 25;
    }

    logger.warn(
        `Invalid levelNum passed to MFCP ${chartData.levelNum}. ChartID ${chartData.chartID}.`
    );

    // failsafe
    return null;
}

const VF4GradeCoefficients = {
    S: 1.0,
    "AAA+": 0.99,
    AAA: 0.98,
    "AA+": 0.97,
    AA: 0.96,
    "A+": 0.95,
    A: 0.94,
    B: 0.93,
    C: 0.92,
    D: 0.91,
};

const VF5GradeCoefficients = {
    S: 1.05,
    "AAA+": 1.02,
    AAA: 1.0,
    "AA+": 0.97,
    AA: 0.94,
    "A+": 0.91, // everything below this point (incl. this) is marked with a (?) in bemaniwiki.
    A: 0.88,
    B: 0.85,
    C: 0.82,
    D: 0.8,
};

const VF5LampCoefficients = {
    "PERFECT ULTIMATE CHAIN": 1.1,
    "ULTIMATE CHAIN": 1.05,
    "EXCESSIVE CLEAR": 1.02,
    CLEAR: 1.0,
    FAILED: 0.5,
};

export function CalculateVF4(
    grade: Grades["sdvx:Single"],
    per: number,
    levelNum: number,
    logger: KtLogger
) {
    const multiplier = 25;

    const gradeCoefficient = VF4GradeCoefficients[grade];

    if (!gradeCoefficient) {
        logger.warn(`Invalid grade of ${grade} passed to CalculateVF4. Returning null.`);
        return null;
    }

    const percent = per / 100;
    if (!levelNum || !percent) {
        return 0;
    }

    return Math.floor(multiplier * (levelNum + 1) * percent * gradeCoefficient);
}

// WARNING:
// this formula is allegedly tentative according to bemaniwiki.
// idk if it's right, but it must be close enough.
export function CalculateVF5(
    grade: Grades["sdvx:Single"],
    lamp: Lamps["sdvx:Single"],
    per: number,
    levelNum: number,
    logger: KtLogger
) {
    const gradeCoefficient = VF5GradeCoefficients[grade];
    const lampCoefficient = VF5LampCoefficients[lamp];

    if (!lampCoefficient) {
        logger.warn(`Invalid lamp of ${lamp} passed to CalculateVF5. Returning null.`);
        return null;
    }
    if (!gradeCoefficient) {
        logger.warn(`Invalid grade of ${grade} passed to CalculateVF5. Returning null.`);
        return null;
    }

    const percent = per / 100;
    if (!levelNum || !percent) {
        return 0;
    }

    return Math.floor(levelNum * 2 * percent * gradeCoefficient * lampCoefficient) / 100;
}

// function CalculateJubility(
//     dryScore: DryScore<"jubeat:Single">,
//     chartData: AnyChartDocument,
//     logger: KtLogger
// ) {
//     let rate = dryScore.calculatedData.gameSpecific.musicRate; eurgh, this is hard.
// }
