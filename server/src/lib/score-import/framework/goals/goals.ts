import { integer, Game, GoalDocument, UserGoalDocument } from "kamaitachi-common";
import { EvaluateGoalForUser } from "../../../../utils/goal";
import db from "../../../../external/mongo/db";
import { KtLogger } from "../../../../utils/types";

/**
 * Update a user's progress on all of their set goals.
 */
export async function GetAndUpdateUsersGoals(
    game: Game,
    userID: integer,
    chartIDs: Set<string>,
    logger: KtLogger
) {
    const { goals, userGoalsMap } = await GetRelevantGoals(game, userID, chartIDs, logger);

    if (!goals.length) {
        // if we hit the below code with an empty array mongodb will flip out on the bulkwrite op
        return [];
    }

    logger.verbose(`Found ${goals.length} relevant goals.`);

    return UpdateGoalsForUser(goals, userGoalsMap, userID, logger);
}

export async function UpdateGoalsForUser(
    goals: GoalDocument[],
    userGoalsMap: Map<string, UserGoalDocument>,
    userID: integer,
    logger: KtLogger
) {
    const returns = await Promise.all(
        goals.map((goal: GoalDocument) => {
            const userGoal = userGoalsMap.get(goal.goalID);

            if (!userGoal) {
                logger.error(
                    `UserGoal:GoalID mismatch ${goal.goalID} - this user has no userGoal for this, yet it is set.`
                );
                return;
            }

            return ProcessGoal(goal, userGoal, userID, logger);
        })
    );

    const importInfo = [];
    const bulkWrite = [];

    for (const ret of returns) {
        if (!ret) {
            continue;
        }

        importInfo.push(ret.import);
        bulkWrite.push(ret.bwrite);
    }

    if (bulkWrite.length === 0) {
        // bulkwrite cannot be an empty array -- this means there's nothing to update or return, then.
        // i.e. goals was non empty but returns was entirely [undefined, undefined...].
        return [];
    }

    await db["user-goals"].bulkWrite(bulkWrite, { ordered: false });

    return importInfo;
}

/**
 * Calls EvaluateGoalForUser, then processes the returns into a bulkWrite
 * operation and an import statistic.
 * @returns undefined on error (i.e. EvaluateGoalForUser) OR if there's nothing
 * to say (i.e. user didnt raise the goal).
 */
export async function ProcessGoal(
    goal: GoalDocument,
    userGoal: UserGoalDocument,
    userID: integer,
    logger: KtLogger
) {
    const res = await EvaluateGoalForUser(goal, userID, logger);

    if (!res) {
        // some sort of error occured - its logged by the function.
        return;
    }

    // if the user has changed their progress on the goal
    if (userGoal.progress !== res.progress) {
        // if the user has improved their progress on the goal
        // if userGoal.progress is null, then res.progress must be non-null, and therefore an improvement.
        if (
            userGoal.progress === null ||
            (res.progress !== null && userGoal.progress < res.progress)
        ) {
            // @todo #99 emit something
        }
    } else if (userGoal.outOf === res.outOf) {
        // if the users progress hasn't changed AND the outOf hasn't
        // then nothing has changed.

        // the outOf check is to account for things such as folder sizes changing underfoot
        // which would always require an update.
        return;
    }

    // if this is a newly-achieved goal
    if (res.achieved && !userGoal.achieved) {
        // @todo #99 emit something
    }

    const newData = {
        progress: res.progress,
        progressHuman: res.progressHuman,
        outOf: res.outOf,
        outOfHuman: res.outOfHuman,
        achieved: res.achieved,
    };

    const bulkWrite = {
        updateOne: {
            filter: { _id: userGoal._id! },
            update: {
                $set: {
                    ...newData,
                    timeAchieved: newData.achieved ? Date.now() : null,
                    // we're guaranteed that this works, because things
                    // that haven't changed return nothing instead of
                    // getting to this point.
                    lastInteraction: Date.now(),
                },
            },
        },
    };

    return {
        bwrite: bulkWrite,
        import: {
            goalID: goal.goalID,
            old: {
                progress: userGoal.progress,
                progressHuman: userGoal.progressHuman,
                outOf: userGoal.outOf,
                outOfHuman: userGoal.outOfHuman,
                achieved: userGoal.achieved,
            },
            new: newData,
        },
    };
}

/**
 * Gets the goals the user has set for this game and playtype.
 * Then, filters it based on the chartIDs involved in this import.
 *
 * This optimisation allows users to have *lots* of goals, but only ever
 * evaluate the ones we need to.
 * @returns An array of Goals, and an array of userGoals.
 */
export async function GetRelevantGoals(
    game: Game,
    userID: integer,
    chartIDs: Set<string>,
    logger: KtLogger
): Promise<{ goals: GoalDocument[]; userGoalsMap: Map<string, UserGoalDocument> }> {
    const userGoals = await db["user-goals"].find({ game, userID });

    logger.verbose(`Found user has ${userGoals.length} goals.`);

    if (!userGoals.length) {
        return { goals: [], userGoalsMap: new Map() };
    }

    const goalIDs = userGoals.map((e) => e.goalID);

    const chartIDsArr: string[] = [];
    for (const c of chartIDs) {
        chartIDsArr.push(c);
    }

    const goals = await Promise.all([
        // this gets the relevantGoals for direct and multi
        db.goals.find({
            "charts.type": { $in: ["single", "multi"] },
            "charts.data": { $in: chartIDsArr },
            goalID: { $in: goalIDs },
        }),
        db.goals.find({
            "charts.type": "any",
            goalID: { $in: goalIDs },
        }),
        GetRelevantFolderGoals(goalIDs, chartIDsArr),
    ]).then((r) => r.flat(1));

    const goalSet = new Set(goals.map((e) => e.goalID));

    const userGoalsMap: Map<string, UserGoalDocument> = new Map();

    for (const userGoal of userGoals) {
        if (!goalSet.has(userGoal.goalID)) {
            continue;
        }
        // since these are guaranteed to be unique, lets make a hot map of goalID -> userGoalDocument, so we can
        // pull them in for post-processing and filter out the userGoalDocuments that aren't relevant.
        userGoalsMap.set(userGoal.goalID, userGoal);
    }

    return {
        goals,
        userGoalsMap,
    };
}

/**
 * Returns the set of goals where its folder contains any member
 * of chartIDsArr.
 */
export function GetRelevantFolderGoals(goalIDs: string[], chartIDsArr: string[]) {
    // Slightly black magic - this is kind of like doing an SQL join.
    // it's weird to do this in mongodb, but this seems like the right
    // way to actually handle this.

    return db.goals.aggregate([
        {
            $match: {
                "charts.type": "folder",
                goalID: { $in: goalIDs },
            },
        },
        {
            $lookup: {
                from: "folder-chart-lookup",
                localField: "charts.data",
                foreignField: "folderID",
                as: "folderCharts",
            },
        },
        {
            $match: {
                "folderCharts.chartID": { $in: chartIDsArr },
            },
        },
        {
            $project: {
                folderCharts: 0,
            },
        },
    ]);
}
