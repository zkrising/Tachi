import { PrivateUserDocument, ScoreDocument } from "kamaitachi-common";
import { grades } from "kamaitachi-common/js/config";
import db from "../../db/db";
import MigrateRecords from "./migrate";

// HERE. WE. GO!

function ConvertFn(c: any): ScoreDocument {
    let base: Partial<ScoreDocument> = {
        userID: c.userID,
        songID: c.songID,
        playtype: c.scoreData.playtype,
        difficulty: c.scoreData.difficulty,
        chartID: c.chartID,
        game: c.game,
        timeAdded: c.timeAdded,
        timeAchieved: c.timeAchieved,
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

    switch (base.game) {
        case "bms":
            break;

        default:
            break;
    }

    return base;
}

(async () => {
    await MigrateRecords(db.users, "users", ConvertFn);

    process.exit(0);
})();
