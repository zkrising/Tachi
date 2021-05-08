// idk what needs to go here just yet - need to write the goal support in score import - zkldi
import { GoalDocument, integer, PBScoreDocument } from "kamaitachi-common";
import db from "../db/db";
import { KtLogger } from "../types";
import { GetFolderChartIDs } from "./folder-core";
import { FilterQuery } from "mongodb";

export interface EvaluatedGoalReturn {
    achieved: boolean;
    progress: number;
    outOf: number;
    progressHuman: string;
    outOfHuman: string;
}

export async function EvaluateGoalForUser(
    goal: GoalDocument,
    userID: integer,
    logger: KtLogger
): Promise<EvaluatedGoalReturn | null> {
    // First, we need to resolve the set of charts this
    // goal involves.
    let chartIDs = await ResolveGoalCharts(goal);

    if (chartIDs === undefined) {
        logger.error(
            `Invalid goal ${goal.goalID} - has nonsense chartsType of ${goal.charts.type}, ignoring.`
        );
        return null;
    }

    // lets configure a "base" query for our requests.
    let scoreQuery: FilterQuery<PBScoreDocument> = {
        userID,
        // normally, this would be a VERY WORRYING line of code, but goal.criteria.key is guaranteed to be
        // within a specific set of fields.
        [goal.criteria.key]: { $gte: goal.criteria.value },
    };

    if (chartIDs) {
        scoreQuery.chartIDs = { $in: chartIDs };
    }

    // Next, we need to figure out our criteria.
    if (goal.criteria.mode === "single") {
        let res = await db["score-pbs"].findOne(scoreQuery);

        if (res) {
            // hack, but guaranteed to work.
            let scoreDataKey = goal.criteria.key.split(".")[1] as
                | "lampIndex"
                | "gradeIndex"
                | "score"
                | "percent";

            return {
                achieved: true,
                outOf: goal.criteria.value,
                progress: res.scoreData[scoreDataKey],
                outOfHuman: "", // @todo
                progressHuman: "",
            };
        }

        // if we weren't successful, we have to get the users next best score and put it up here
        // this is made infinitely easier by the existance of score-pbs.

        // @todo
    } else if (goal.criteria.mode === "abs" || goal.criteria.mode === "proportion") {
        let count;

        // abs -> Absolute mode, such as clear 10 charts.
        if (goal.criteria.mode === "abs") {
            count = goal.criteria.value;
        } else {
            // proportion -> Proportional mode, the value
            // is a multiplier for the amount of charts
            // available -- i.e. 0.1 * charts.

            let totalChartCount;

            if (chartIDs === null) {
                // edge case: proportion goals on "any"
                // charts (i.e. clear 20% of charts) need to
                // know how many charts the game has!
                totalChartCount = await db.charts[goal.game].count({ playtype: goal.playtype });
            } else {
                totalChartCount = chartIDs.length;
            }

            count = Math.floor(goal.criteria.value * totalChartCount);
        }

        let userCount = await db["score-pbs"].count(scoreQuery);

        return {
            achieved: userCount >= count,
            progress: userCount,
            outOf: count,
            progressHuman: userCount.toString(),
            outOfHuman: userCount.toString(),
        };
    }

    logger.error(
        `Invalid goal: ${goal.goalID}, unknown criteria.mode ${goal.criteria.mode}, ignoring.`
    );

    return null;
}

/**
 * Resolves the set of charts involved with this goal.
 * @param goal
 * @returns An array of chartIDs, except if the goal chart type is "any", in which case, it returns null.
 */
function ResolveGoalCharts(goal: GoalDocument): Promise<string[]> | string[] | null | undefined {
    if (goal.charts.type === "single") {
        return [goal.charts.data];
    } else if (goal.charts.type === "multi") {
        return goal.charts.data;
    } else if (goal.charts.type === "folder") {
        return GetFolderChartIDs(goal.charts.data);
    } else if (goal.charts.type === "any") {
        return null; // special case.
    }
}
