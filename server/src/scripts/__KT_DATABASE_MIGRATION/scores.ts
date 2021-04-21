import { PrivateUserDocument, ScoreDocument } from "kamaitachi-common";
import { grades, lamps } from "kamaitachi-common/js/config";
import db from "../../db/db";
import { CreateScoreID } from "../../score-import/framework/core/score-id";
import MigrateRecords from "./migrate";

// HERE. WE. GO!

function ConditionalAssign(base: any, baseProp: string, other: any, otherProp: string) {
    if (Object.prototype.hasOwnProperty.call(other, otherProp)) {
        base[baseProp] = other[otherProp];
    }
}

function ConvertFn(c: any): ScoreDocument {
    let base: Omit<ScoreDocument, "scoreID"> = {
        userID: c.userID,
        songID: c.songID,
        playtype: c.scoreData.playtype,
        difficulty: c.scoreData.difficulty,
        chartID: c.chartID,
        game: c.game,
        timeAdded: c.timeAdded,
        timeAchieved: Number.isNaN(c.timeAchieved) ? null : c.timeAchieved,
        isScorePB: c.isScorePB,
        isLampPB: c.isLampPB,
        comment: c.comment ?? null,
        highlight: c.highlight ?? false,
        service: c.service,
        importType: null,
        calculatedData: c.calculatedData,
        scoreData: {
            esd: c.scoreData.esd ?? null,
            grade: c.scoreData.grade,
            // @ts-expect-error shut
            gradeIndex: grades[c.game].indexOf(c.scoreData.grade),
            lamp: c.scoreData.lamp,
            // @ts-expect-error shut
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
        } else if (base.game === "bms") {
            // @ts-expect-error shut
            if (base.scoreData.hitMeta.gauge === -1) {
                // @ts-expect-error shut
                base.scoreData.hitMeta.gauge = null;
            }

            // @ts-expect-error shut
            if (base.scoreData.hitMeta.bp === -1 || Number.isNaN(base.scoreData.hitMeta.bp)) {
                // @ts-expect-error shut
                base.scoreData.hitMeta.bp = null;
            }

            ConditionalAssign(base.scoreMeta, "random", c.scoreMeta, "optionsRandom");
            ConditionalAssign(base.scoreMeta, "inputDevice", c.scoreData.hitMeta, "inputDevice");

            // @ts-expect-error shut
            delete base.scoreData.hitMeta.inputDevice;
        }
    }

    let scoreID = CreateScoreID(base.userID, base, base.chartID);

    let score: ScoreDocument = {
        ...base,
        scoreID,
    };

    return score;
}

(async () => {
    await MigrateRecords(db.scores, "scores", ConvertFn);

    process.exit(0);
})();
