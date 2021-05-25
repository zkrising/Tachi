/* eslint-disable @typescript-eslint/no-explicit-any */

import { PrivateUserDocument, ScoreDocument } from "kamaitachi-common";
import { grades, lamps, supportedGames, validPlaytypes } from "kamaitachi-common/js/config";
import db from "../../src/db/db";
import MigrateRecords from "./migrate";
import CreateLogCtx from "../../src/common/logger";
import { CreateScoreID } from "../../src/score-import/framework/common/score-utils";

const logger = CreateLogCtx(__filename);

// HERE. WE. GO!

function ConditionalAssign(base: any, baseProp: string, other: any, otherProp: string) {
    if (Object.prototype.hasOwnProperty.call(other, otherProp)) {
        base[baseProp] = other[otherProp];
    }
}

function ConvertFn(c: any): ScoreDocument | null {
    if (!supportedGames.includes(c.game)) {
        logger.warn(`Ignored game ${c.game}`);
        return null;
    }

    if (["popn", "jubeat", "gitadora", "usc"].includes(c.game)) {
        return null;
    }

    if (validPlaytypes[c.game].includes(c.playtype)) {
        logger.warn(`Ignored game pt ${c.game}, ${c.playtype}`);
    }

    const base: Omit<ScoreDocument, "scoreID"> = {
        userID: c.userID,
        songID: c.songID,
        playtype: c.scoreData.playtype,
        chartID: c.chartID,
        game: c.game,
        timeAdded: c.timeAdded,
        timeAchieved: Number.isNaN(c.timeAchieved) ? null : c.timeAchieved,
        comment: c.comment ?? null,
        highlight: c.highlight ?? false,
        service: c.service,
        importType: null,
        calculatedData: c.calculatedData,
        scoreData: {
            esd: c.scoreData.esd ?? null,
            grade: c.scoreData.grade,
            gradeIndex: grades[c.game].indexOf(c.scoreData.grade),
            lamp: c.scoreData.lamp,
            lampIndex: lamps[c.game].indexOf(c.scoreData.lamp),
            percent: c.scoreData.percent,
            score: c.scoreData.score,
            hitData: c.scoreData.hitData,
            hitMeta: c.scoreData.hitMeta,
        },
        scoreMeta: {},
    };

    if (c.scoreMeta) {
        if (base.game === "iidx") {
            ConditionalAssign(base.scoreMeta, "random", c.scoreMeta, "optionsRandom");
            ConditionalAssign(base.scoreMeta, "gauge", c.scoreMeta, "optionsGauge");
            ConditionalAssign(base.scoreMeta, "assist", c.scoreMeta, "optionsAssist");
            ConditionalAssign(base.scoreMeta, "range", c.scoreMeta, "optionsRange");
            ConditionalAssign(base.scoreMeta, "pacemaker", c.scoreMeta, "pacemaker");
            ConditionalAssign(base.scoreMeta, "pacemakerName", c.scoreMeta, "pacemakerName");
            ConditionalAssign(base.scoreMeta, "pacemakerTarget", c.scoreMeta, "pacemakerTarget");

            if (base.playtype === "DP" && !Array.isArray(base.scoreMeta.random)) {
                base.scoreMeta.random = null;
            }

            // @ts-expect-error asdf
            if (base.scoreMeta.range === "") {
                // @ts-expect-error asdf
                base.scoreMeta.range = "NONE";
            }
        } else if (base.game === "bms") {
            ConditionalAssign(base.scoreMeta, "random", c.scoreMeta, "optionsRandom");
            ConditionalAssign(base.scoreMeta, "inputDevice", c.scoreData.hitMeta, "inputDevice");
        }
    }

    // @ts-expect-error shut
    if (base.scoreData.hitMeta.bp === -1 || Number.isNaN(base.scoreData.hitMeta.bp)) {
        // @ts-expect-error shut
        base.scoreData.hitMeta.bp = null;
    }

    if (base.game === "iidx") {
        // @ts-expect-error nope
        if (base.scoreData.hitMeta.gauge > 200) {
            // @ts-expect-error nope
            base.scoreData.hitMeta.gauge = null;
        }

        // @ts-expect-error nope
        if (base.scoreData.hitMeta.gaugeHistory) {
            // @ts-expect-error nope
            base.scoreData.hitMeta.gaugeHistory = base.scoreData.hitMeta.gaugeHistory.map((e) =>
                e > 200 ? null : e
            );
        }
    } else if (base.game === "bms") {
        // @ts-expect-error shut
        if (base.scoreData.hitMeta.gauge === -1) {
            // @ts-expect-error shut
            base.scoreData.hitMeta.gauge = null;
        }

        // @ts-expect-error shut
        delete base.scoreData.hitMeta.inputDevice;
    } else if (base.game === "sdvx" || base.game === "usc") {
        ConditionalAssign(base.scoreData.hitData, "miss", base.scoreData.hitData, "error");

        //@ts-expect-error yea
        delete base.scoreData.hitData.error;
    } else if (base.game === "chunithm") {
        if (base.scoreData.percent === 101) {
            base.scoreData.grade === "SSS";
        }
    }

    if (base.service === "mm") {
        base.service = "maimagic";
    }

    const scoreID = CreateScoreID(base.userID, base, base.chartID);

    const score: ScoreDocument = {
        ...base,
        scoreID,
    };

    return score;
}

(async () => {
    await MigrateRecords(db.scores, "scores", ConvertFn);

    process.exit(0);
})();
