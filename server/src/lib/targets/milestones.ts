import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { GoalSubscriptionDocument, integer, MilestoneDocument } from "tachi-common";
import { EvaluatedGoalReturn, EvaluateGoalForUser } from "./goals";

const logger = CreateLogCtx(__filename);

/**
 * Retrieves the goalID documents in a single array from the
 * nested structure of milestones.
 */
export function GetGoalIDsFromMilestone(milestone: MilestoneDocument) {
	// this sucks - maybe a nicer way to do this, because nested
	// maps are just ugly
	return milestone.milestoneData.map((e) => e.goals.map((e) => e.goalID)).flat(1);
}

/**
 * Return all the goals inside this milestone.
 */
export async function GetGoalsInMilestone(milestone: MilestoneDocument) {
	const goalIDs = GetGoalIDsFromMilestone(milestone);

	const goals = await db.goals.find({
		goalID: { $in: goalIDs },
	});

	if (goals.length !== goalIDs.length) {
		logger.error(
			`Milestone ${milestone.name} has ${goalIDs.length} goals registered, but we could only find ${goals.length} in the database?`,
			{ goals: goals.length, milestone, goalIDs: goalIDs.length }
		);
		throw new Error(`Milestone is corrupt. Not the right amount of goals in db?`);
	}

	if (goalIDs.length < 2) {
		logger.error(
			`Milestone ${milestone.name} resolves to less than 2 goals. Isn't a valid milestone?`,
			{ milestone }
		);
		throw new Error(`Milestone is corrupt. Doesn't have enough goals.`);
	}

	return goals;
}

/**
 * Work out how many goals need to be achieved for this
 * milestone to be considered completed.
 */
export function CalculateMilestoneOutOf(milestone: MilestoneDocument) {
	const goalIDs = GetGoalIDsFromMilestone(milestone);

	if (milestone.criteria.type === "all") {
		return goalIDs.length;
	} else if (milestone.criteria.type === "abs") {
		if (milestone.criteria.value === null) {
			throw new Error(
				`Invalid milestone ${milestone.milestoneID} - abs and null are not compatible.`
			);
		}

		return milestone.criteria.value!;
	} else if (milestone.criteria.type === "proportion") {
		if (milestone.criteria.value === null) {
			throw new Error(
				`Invalid milestone ${milestone.milestoneID} - proportion and null are not compatible.`
			);
		}

		return Math.floor(milestone.criteria.value * goalIDs.length);
	}

	throw new Error(
		`Invalid milestone.criteria.type of ${milestone.criteria.type} -- milestoneID ${milestone.milestoneID}`
	);
}

type EvaluatedGoalResult = EvaluatedGoalReturn & { goalID: string };

/**
 * Evaluate a user's progress on a milestone, regardless of whether they have it
 * assigned or not.
 *
 * @returns All of the goals in the milestone. The users progress on each individual goal,
 * their overall progress, what the milestone was outOf, and whether they achieved it or
 * not.
 */
export async function EvaluateMilestoneProgress(userID: integer, milestone: MilestoneDocument) {
	const goals = await GetGoalsInMilestone(milestone);

	const isSubscribedToMilestone = await db["milestone-subs"].findOne({
		milestoneID: milestone.milestoneID,
	});

	// If the user is subscribed the milestone, we don't need to calculate
	// their progress on each goal.
	const goalSubMap = new Map<string, GoalSubscriptionDocument>();
	if (isSubscribedToMilestone) {
		const goalSubs = await db["goal-subs"].find({
			goalID: { $in: goals.map((e) => e.goalID) },
			userID,
		});

		for (const sub of goalSubs) {
			goalSubMap.set(sub.goalID, sub);
		}
	}

	const results: EvaluatedGoalResult[] = await Promise.all(
		goals.map(async (goal) => {
			if (isSubscribedToMilestone) {
				const goalSub = goalSubMap.get(goal.goalID);

				if (!goalSub) {
					logger.error(
						`User ${userID} has a corrupt subscription to milestone '${milestone.name}', They do not have all the goals in this milestone assigned.`
					);

					throw new Error(
						`User has corrupt subscription to milestone. Cannot calculate.`
					);
				}

				return {
					achieved: goalSub.achieved,
					progress: goalSub.progress,
					outOf: goalSub.outOf,
					progressHuman: goalSub.progressHuman,
					outOfHuman: goalSub.outOfHuman,
					goalID: goal.goalID,
				};
			}

			const result = await EvaluateGoalForUser(goal, userID, logger);

			if (!result) {
				logger.error(
					`Failed to calculate ${userID} result for goal '${goal.title}'. Is the goal valid?`,
					{ goal, milestone }
				);

				throw new Error(`Goal inside milestone is corrupt.`);
			}

			return {
				achieved: result.achieved,
				progress: result.progress,
				outOf: result.outOf,
				progressHuman: result.progressHuman,
				outOfHuman: result.outOfHuman,
				goalID: goal.goalID,
			};
		})
	);

	const progress = results.filter((e) => e.achieved).length;
	const outOf = CalculateMilestoneOutOf(milestone);

	const achieved = progress >= outOf;

	return {
		goals,
		results,
		achieved,
		progress,
		outOf,
	};
}
