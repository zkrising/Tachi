import {
	EvaluateGoalForUser,
	SubscribeToGoal,
	UnsubscribeFromGoal,
	UnsubscribeFromOrphanedGoalSubs,
} from "./goals";
import db from "external/mongo/db";
import { SubscribeFailReasons } from "lib/constants/err-codes";
import CreateLogCtx from "lib/logger/logger";
import { BulkSendNotification } from "lib/notifications/notifications";
import type { EvaluatedGoalReturn } from "./goals";
import type {
	Game,
	GoalDocument,
	GoalSubscriptionDocument,
	integer,
	Playtype,
	QuestDocument,
	QuestSubscriptionDocument,
} from "tachi-common";

const logger = CreateLogCtx(__filename);

/**
 * Retrieves the goalID documents in a single array from the
 * nested structure of quests.
 */
export function GetGoalIDsFromQuest(quest: QuestDocument) {
	// this sucks - maybe a nicer way to do this, because nested
	// maps are just ugly
	return quest.questData.map((e) => e.goals.map((e) => e.goalID)).flat(1);
}

/**
 * Return all the goals inside this quest.
 */
export async function GetGoalsInQuest(quest: QuestDocument) {
	const goalIDs = GetGoalIDsFromQuest(quest);

	const goals = await db.goals.find({
		goalID: { $in: goalIDs },
	});

	if (goals.length !== goalIDs.length) {
		logger.error(
			`Quest ${quest.name} has ${goalIDs.length} goals registered, but we could only find ${goals.length} in the database?`,
			{ goals: goals.length, quest, goalIDs: goalIDs.length }
		);
		throw new Error(`Quest is corrupt. Not the right amount of goals in db?`);
	}

	// this shouldn't happen, but if it does it's recoverable by just ignoring it.
	if (goalIDs.length < 2) {
		logger.warn(`Quest ${quest.name} resolves to less than 2 goals. Isn't a valid quest?`, {
			quest,
		});
	}

	return goals;
}

/**
 * Return all the goals inside these quests
 */
export async function GetGoalsInQuests(quests: Array<QuestDocument>) {
	const goalIDs = quests.flatMap((quest) => GetGoalIDsFromQuest(quest));

	const goals = await db.goals.find({
		goalID: { $in: goalIDs },
	});

	return goals;
}

/**
 * Work out how many goals need to be achieved for this
 * quest to be considered completed.
 */
export function CalculateQuestOutOf(quest: QuestDocument) {
	const goalIDs = GetGoalIDsFromQuest(quest);

	return goalIDs.length;
}

type EvaluatedGoalResult = EvaluatedGoalReturn & { goalID: string };

/**
 * Evaluate a user's progress on a quest, regardless of whether they have it
 * assigned or not.
 *
 * @returns All of the goals in the quest. The users progress on each individual goal,
 * their overall progress, what the quest was outOf, and whether they achieved it or
 * not.
 */
export async function EvaluateQuestProgress(userID: integer, quest: QuestDocument) {
	const goals = await GetGoalsInQuest(quest);

	const isSubscribedToQuest = await db["quest-subs"].findOne({
		questID: quest.questID,
	});

	// If the user is subscribed the quest, we don't need to calculate
	// their progress on each goal.
	const goalSubMap = new Map<string, GoalSubscriptionDocument>();

	if (isSubscribedToQuest) {
		const goalSubs = await db["goal-subs"].find({
			goalID: { $in: goals.map((e) => e.goalID) },
			userID,
		});

		for (const sub of goalSubs) {
			goalSubMap.set(sub.goalID, sub);
		}
	}

	const goalResults: Array<EvaluatedGoalResult> = await Promise.all(
		goals.map(async (goal) => {
			if (isSubscribedToQuest) {
				let goalSub = goalSubMap.get(goal.goalID);

				if (!goalSub) {
					// shouldn't happen. Let's just correct the user silently.

					logger.warn(
						`User ${userID} has a corrupt subscription to quest '${quest.name}', They do not have all the goals in this quest assigned. Automatically subscribing them to the new goal.`
					);

					const newGoalSub = await SubscribeToGoal(userID, goal, false);

					if (newGoalSub === SubscribeFailReasons.ALREADY_SUBSCRIBED) {
						logger.error(
							`User ${userID} wasn't subscribed to a goal (${goal.goalID}), but subscription failed because they were already subscribed. This should never happen.`
						);
						throw new Error(
							`Quest subscription was corrupt and we failed to subscribe the user to the missing goal.`
						);
					}

					if (newGoalSub === SubscribeFailReasons.ALREADY_ACHIEVED) {
						// lol, wut
						logger.error(
							`Impossible via typesystem: attempted resubscription for user ${userID} on goal ${goal.goalID}, was rejected for being already achieved. Not possible, as we allow already achieved goals here.`
						);

						throw new Error(
							`Quest subscription was corrupt and we failed to subscribe the user to the missing goal.`
						);
					}

					goalSub = newGoalSub;
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
					`Failed to calculate ${userID} result for goal '${goal.name}'. Is the goal valid?`,
					{ goal, quest }
				);

				throw new Error(`Goal inside quest is corrupt.`);
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

	const progress = goalResults.filter((e) => e.achieved).length;
	const outOf = CalculateQuestOutOf(quest);

	const achieved = progress >= outOf;

	return {
		goals,
		goalResults,
		achieved,
		progress,
		outOf,
	};
}

interface QuestSubscriptionReturns {
	questSub: QuestSubscriptionDocument;
	goals: Array<GoalDocument>;
	goalResults: Array<EvaluatedGoalResult>;
}

/**
 * Subscribes the given user to a provided quest. If the user is already subscribed,
 * null is returned.
 *
 * @param denyInstantAchievement - Don't subscribe to the quest if subscribing would cause
 * the user to immediately achieve it.
 */
export async function SubscribeToQuest(
	userID: integer,
	quest: QuestDocument,
	denyInstantAchievement: false
): Promise<QuestSubscriptionReturns | SubscribeFailReasons.ALREADY_SUBSCRIBED>;
export async function SubscribeToQuest(
	userID: integer,
	quest: QuestDocument,
	denyInstantAchievement = true
): Promise<
	| QuestSubscriptionReturns
	| SubscribeFailReasons.ALREADY_ACHIEVED
	| SubscribeFailReasons.ALREADY_SUBSCRIBED
> {
	const isSubscribedToQuest = await db["quest-subs"].findOne({
		userID,
		questID: quest.questID,
	});

	if (isSubscribedToQuest) {
		return SubscribeFailReasons.ALREADY_SUBSCRIBED;
	}

	const result = await EvaluateQuestProgress(userID, quest);

	if (result.achieved && denyInstantAchievement) {
		return SubscribeFailReasons.ALREADY_ACHIEVED;
	}

	// @ts-expect-error TS can't resolve this.
	// because it can't explode out the types.
	const questSub: QuestSubscriptionDocument = {
		progress: result.progress,
		userID,
		questID: quest.questID,
		wasInstantlyAchieved: result.achieved,
		game: quest.game,
		playtype: quest.playtype,
		achieved: result.achieved,
		timeAchieved: result.achieved ? Date.now() : null,
		lastInteraction: null,
	};

	// @optimisable, EvaluateQuestProgress calculates the users progress
	// on each goal. We could probably shorten this by directly inserting the records
	// from result.goalResults ourselves.
	// evaluating goals is fairly cheap though.
	await Promise.all(result.goals.map((goal) => SubscribeToGoal(userID, goal, false)));

	await db["quest-subs"].insert(questSub);

	logger.info(`User ${userID} subscribed to '${quest.name}'.`);

	return { questSub, goals: result.goals, goalResults: result.goalResults };
}

/**
 * Given a questID, update all of its subscriptions to potentially subscribe to any
 * new goals added to it.
 *
 * @note Updating quest subscriptions just means ensuring that any subscribing
 * users are also subscribed to all goals in that quest. Nothing more.
 *
 * A quest that removes goals will not result in those users having goal subs removed.
 */
export async function UpdateQuestSubscriptions(questID: string) {
	logger.info(`Received update-subscribe call to quest ${questID}.`);

	const subscriptions = await db["quest-subs"].find({ questID });

	const maybeQuest = await db.quests.findOne({ questID });

	// if the quest was deleted, we have to take a more manual approach.
	if (!maybeQuest) {
		// first, remove all subs to this quest
		await db["quest-subs"].remove({
			questID,
		});

		// then, this presents us with an interesting problem.
		// We can't actually know what goals this user was subscribed to as a result
		// of this quest, because said quest no longer exists.

		// To mitigate this, we just prune all goalsubs that no longer have any
		// dependencies
		await Promise.all(
			subscriptions.map((e) => UnsubscribeFromOrphanedGoalSubs(e.userID, e.game, e.playtype))
		);

		logger.info(
			`Quest ${questID} has been deleted. Unsubscribed ${subscriptions.length} users.`
		);

		return;
	}

	// the easiest way to do this? unsubscribe all users from the quest, then subscribe
	// them all again.
	await Promise.all(subscriptions.map((e) => UnsubscribeFromQuest(e, maybeQuest)));

	await Promise.all(subscriptions.map((e) => SubscribeToQuest(e.userID, maybeQuest, false)));

	await BulkSendNotification(
		`The quest '${maybeQuest.name}' has received an update.`,
		subscriptions.map((e) => e.userID),
		{
			type: "QUEST_CHANGED",
			content: {
				questID,
				game: maybeQuest.game,
				playtype: maybeQuest.playtype,
			},
		}
	);
}

/**
 * Unsubscribe from a quest. This will also unsubscribe the user from any goals they're
 * subscribed to as a result.
 *
 * Returns nothing.
 */
export async function UnsubscribeFromQuest(
	questSub: QuestSubscriptionDocument,
	quest: QuestDocument
) {
	const goalIDs = GetGoalIDsFromQuest(quest);

	// remove the quest sub
	// (preventing HAS_QUEST_DEPENDENCIES when this is the quest we're removing anyway)
	await db["quest-subs"].remove({
		questID: questSub.questID,
		userID: questSub.userID,
	});

	const goalSubs = await db["goal-subs"].find({
		userID: questSub.userID,
		goalID: { $in: goalIDs },
	});

	// unsub the user from all goals we can. If we can't unsub from a goal, that's
	// not a problem, we weren't meant to unsubscribe from it.
	await Promise.all(goalSubs.map((e) => UnsubscribeFromGoal(e, true)));
}

/**
 * Given an array of user goal subscriptions, return all the quests this user is
 * subscribed to that subsume these goals.
 */
export async function GetParentQuests(
	userID: integer,
	game: Game,
	playtype: Playtype,
	goalSubs: Array<GoalSubscriptionDocument>
) {
	const questSubs: Array<{ questID: string }> = await db["quest-subs"].find(
		{
			game,
			playtype,
			userID,
		},
		{
			projection: {
				questID: 1,
			},
		}
	);

	const questSubIDs = questSubs.map((e) => e.questID);

	const quests = await db.quests.find({
		questID: { $in: questSubIDs },
		"questData.goals.goalID": { $in: goalSubs.map((e) => e.goalID) },
	});

	return quests;
}

/**
 * Find all quests not in any questlines.
 */
export async function FindStandaloneQuests(game: Game, playtype: Playtype) {
	const res: Array<QuestDocument> = await db.quests.aggregate([
		{
			$match: {
				game,
				playtype,
			},
		},
		{
			$lookup: {
				from: "questlines",
				localField: "questID",
				foreignField: "quests",
				as: "parentQuestlines",
			},
		},
		{
			$match: {
				// is an empty array
				"parentQuestlines.0": { $exists: false },
			},
		},
	]);

	return res;
}
