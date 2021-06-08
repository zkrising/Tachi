// oh boy
/* eslint-disable @typescript-eslint/no-explicit-any */

import { GoalDocument } from "tachi-common";
import db from "../../src/db/db";
import CreateLogCtx from "../../src/common/logger";
import MigrateRecords from "./migrate";

const logger = CreateLogCtx(__filename);

function ConvertFn(c: any): GoalDocument | null {
    let charts: GoalDocument["charts"];

    if (c.directChartID) {
        charts = {
            type: "single",
            data: c.directChartID,
        };
    } else if (c.directChartIDs) {
        charts = {
            type: "multi",
            data: c.directChartIDs,
        };
    } else if (c.chartQuery) {
        logger.warn(`Skipped goal ${c.title}, as it used cQuery.`);
        return null;
    } else {
        logger.warn(`Any Goal ${c.goalID}, ${c.title}. Skipping.`);
        return null;
    }

    const partialCriteria: Partial<GoalDocument["criteria"]> = {
        mode: "single",
    };

    if (c.scoreQuery["scoreData¬lampIndex"]) {
        partialCriteria.key = "scoreData.lampIndex";
    } else if (c.scoreQuery["scoreData¬gradeIndex"]) {
        partialCriteria.key = "scoreData.gradeIndex";
    } else if (c.scoreQuery["scoreData¬score"]) {
        partialCriteria.key = "scoreData.score";
    } else if (c.scoreQuery["scoreData¬percent"]) {
        partialCriteria.key = "scoreData.percent";
    } else {
        throw new Error(`Invalid goal ${c.goalID} ${c.title}.`);
    }

    const v = c.scoreQuery[partialCriteria.key.replace(/\./gu, "¬")];

    const value = v ? v["~gte"] : undefined;

    // would break for value == 0, but a goal would never be
    // zero.
    if (!value) {
        throw new Error(`Invalid goal ${c.goalID} ${c.title}.`);
    }

    partialCriteria.value = value;

    // @ts-expect-error ts cant resolve this union properly
    const newGoalDoc: GoalDocument = {
        game: c.game,
        playtype: c.playtype,
        title: c.title,
        timeAdded: c.timeAdded,
        goalID: c.goalID, // maybe
        createdBy: c.createdBy,
        charts,
        criteria: partialCriteria as GoalDocument["criteria"],
    };

    return newGoalDoc;
}

(async () => {
    await MigrateRecords(db.goals, "goals", ConvertFn);

    process.exit(0);
})();
