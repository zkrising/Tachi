import { integer, Game, GoalDocument, GoalSubscriptionDocument } from "tachi-common";
import { EvaluateGoalForUser } from "lib/targets/goals";
import db from "external/mongo/db";
import { KtLogger } from "lib/logger/logger";
import { EmitWebhookEvent } from "lib/webhooks/webhooks";

/**
 * Update a user's progress on all of their set goals.
 */
export async function GetAndUpdateUsersGoals(
	game: Game,
	userID: integer,
	chartIDs: Set<string>,
	logger: KtLogger
) {
	const { goals, goalSubsMap } = await GetRelevantGoals(game, userID, chartIDs, logger);

	if (!goals.length) {
		// if we hit the below code with an empty array mongodb will flip out on the bulkwrite op
		return [];
	}

	logger.verbose(`Found ${goals.length} relevant goals.`);

	return UpdateGoalsForUser(goals, goalSubsMap, userID, logger);
}

export async function UpdateGoalsForUser(
	goals: GoalDocument[],
	goalSubsMap: Map<string, GoalSubscriptionDocument>,
	userID: integer,
	logger: KtLogger
) {
	const returns = await Promise.all(
		goals.map((goal: GoalDocument) => {
			const goalSub = goalSubsMap.get(goal.goalID);

			if (!goalSub) {
				logger.error(
					`UserGoal:GoalID mismatch ${goal.goalID} - this user has no goalSub for this, yet it is set.`
				);
				return;
			}

			return ProcessGoal(goal, goalSub, userID, logger);
		})
	);

	const importInfo = [];
	const bulkWrite = [];
	const webhookEventContent = [];

	for (const ret of returns) {
		if (!ret) {
			continue;
		}

		importInfo.push(ret.import);
		bulkWrite.push(ret.bwrite);

		if (ret.webhookEvent) {
			webhookEventContent.push(ret.webhookEvent);
		}
	}

	if (bulkWrite.length === 0) {
		// bulkwrite cannot be an empty array -- this means there's nothing to update or return, then.
		// i.e. goals was non empty but returns was entirely [undefined, undefined...].
		return [];
	}

	if (webhookEventContent.length !== 0) {
		await EmitWebhookEvent({
			type: "goals-achieved/v1",
			content: { goals: webhookEventContent, userID, game: goals[0].game },
		});
	}

	await db["goal-subs"].bulkWrite(bulkWrite, { ordered: false });

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
	goalSub: GoalSubscriptionDocument,
	userID: integer,
	logger: KtLogger
) {
	const res = await EvaluateGoalForUser(goal, userID, logger);

	if (!res) {
		// some sort of error occured - its logged by the previous function.
		return;
	}

	// nothing has changed
	if (goalSub.progress === res.progress && goalSub.outOf === res.outOf) {
		return;
	}

	const newData = {
		progress: res.progress,
		progressHuman: res.progressHuman,
		outOf: res.outOf,
		outOfHuman: res.outOfHuman,
		achieved: res.achieved,
	};

	const oldData = {
		progress: goalSub.progress,
		progressHuman: goalSub.progressHuman,
		outOf: goalSub.outOf,
		outOfHuman: goalSub.outOfHuman,
		achieved: goalSub.achieved,
	};

	let webhookEvent = null;
	// if this is a newly-achieved goal
	if (res.achieved && !goalSub.achieved) {
		webhookEvent = {
			goalID: goal.goalID,
			old: oldData,
			new: newData,
			playtype: goal.playtype,
		};
	}

	const setData = {
		...newData,
		timeAchieved: newData.achieved ? Date.now() : null,
		// we're guaranteed that this works, because things
		// that haven't changed return nothing instead of
		// getting to this point.
		lastInteraction: Date.now(),
	} as Partial<GoalSubscriptionDocument>;

	// If this goal was achieved, and is now *not* achieved, we need to unset
	// some things.
	if (goalSub.achieved && !res.achieved) {
		logger.info(`User ${userID} lost their achieved status on ${goal.name}.`, {
			goal,
			res,
			goalSub,
		});

		// This goal can't be marked as instantly achieved, since it was lost.
		setData.wasInstantlyAchieved = false;
	}

	const bulkWrite = {
		updateOne: {
			filter: { _id: goalSub._id! },
			update: {
				$set: setData,
			},
		},
	};

	return {
		bwrite: bulkWrite,
		import: {
			goalID: goal.goalID,
			old: oldData,
			new: newData,
		},
		webhookEvent,
	};
}

/**
 * Gets the goals the user has set for this game and playtype.
 * Then, filters it based on the chartIDs involved in this import.
 *
 * This optimisation allows users to have *lots* of goals, but only ever
 * evaluate the ones we need to.
 * @returns An array of Goals, and an array of goalSubs.
 */
export async function GetRelevantGoals(
	game: Game,
	userID: integer,
	chartIDs: Set<string>,
	logger: KtLogger
): Promise<{ goals: GoalDocument[]; goalSubsMap: Map<string, GoalSubscriptionDocument> }> {
	const goalSubs = await db["goal-subs"].find({ game, userID }, { projectID: true });

	logger.verbose(`Found user has ${goalSubs.length} goals.`);

	if (!goalSubs.length) {
		return { goals: [], goalSubsMap: new Map() };
	}

	const goalIDs = goalSubs.map((e) => e.goalID);

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

	const goalSubsMap: Map<string, GoalSubscriptionDocument> = new Map();

	for (const goalSub of goalSubs) {
		if (!goalSet.has(goalSub.goalID)) {
			continue;
		}
		// since these are guaranteed to be unique, lets make a hot map of goalID -> goalSubDocument, so we can
		// pull them in for post-processing and filter out the goalSubDocuments that aren't relevant.
		goalSubsMap.set(goalSub.goalID, goalSub);
	}

	return {
		goals,
		goalSubsMap,
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
