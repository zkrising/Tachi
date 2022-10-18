import dm from "deepmerge";
import db from "external/mongo/db";
import t from "tap";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import {
	HC511Goal,
	HC511UserGoal,
	TestingIIDXSPQuest,
	TestingIIDXSPQuestSub,
} from "test-utils/test-data";
import type {
	GoalDocument,
	GoalSubscriptionDocument,
	QuestDocument,
	QuestSubscriptionDocument,
} from "tachi-common";

function mkGoalSub(merge: Partial<GoalSubscriptionDocument>) {
	return dm(HC511UserGoal, merge);
}

function mkGoal(merge: Partial<GoalDocument>) {
	return dm(HC511Goal, merge);
}

function mkQuest(merge: Partial<QuestDocument>) {
	return dm(TestingIIDXSPQuest, merge);
}

function mkQuestSub(merge: Partial<QuestSubscriptionDocument>) {
	return dm(TestingIIDXSPQuestSub, merge);
}

t.test("GET /api/v1/users/:userID/games/:game/:playtype/targets/recently-achieved", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should return subscriptions that were recently achieved by this user.", async (t) => {
		await db.goals.insert([
			mkGoal({
				goalID: "achieved_goal",
			}),
			mkGoal({
				goalID: "not_achieved_goal",
			}),
		]);

		await db["goal-subs"].insert([
			mkGoalSub({
				achieved: true,
				timeAchieved: 1000,
				goalID: "achieved_goal",
			}),
			mkGoalSub({
				achieved: false,
				goalID: "not_achieved_goal",
			}),
		]);

		await db.quests.insert([
			mkQuest({}),
			mkQuest({
				questID: "not_achieved_quest",
			}),
		]);

		await db["quest-subs"].insert([
			mkQuestSub({
				achieved: true,
				timeAchieved: 2000,
			}),
			mkQuestSub({
				achieved: false,
				questID: "not_achieved_quest",
			}),
		]);

		const res = await mockApi.get("/api/v1/users/1/games/iidx/SP/targets/recently-achieved");

		t.equal(res.statusCode, 200);

		t.hasStrict(res.body.body, {
			quests: [{ questID: "example_quest_id" }],
			goals: [{ goalID: "achieved_goal" }],
			goalSubs: [{ goalID: "achieved_goal" }],
			questSubs: [{ questID: "example_quest_id" }],
			user: { id: 1 },
		});

		t.equal(res.body.body.goals.length, 1);
		t.equal(res.body.body.quests.length, 1);
		t.equal(res.body.body.goalSubs.length, 1);
		t.equal(res.body.body.questSubs.length, 1);

		t.end();
	});

	t.end();
});

t.test("GET /api/v1/users/:userID/games/:game/:playtype/targets/recently-raised", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should return subscriptions that were recently achieved by this user.", async (t) => {
		await db.goals.insert([
			mkGoal({
				goalID: "achieved_goal",
			}),
			mkGoal({
				goalID: "not_achieved_goal",
			}),
		]);

		await db["goal-subs"].insert([
			mkGoalSub({
				achieved: true,
				timeAchieved: 1000,
				goalID: "achieved_goal",
			}),
			mkGoalSub({
				achieved: false,
				lastInteraction: 1000,
				goalID: "not_achieved_goal",
			}),
		]);

		await db.quests.insert([
			mkQuest({}),
			mkQuest({
				questID: "not_achieved_quest",
			}),
		]);

		await db["quest-subs"].insert([
			mkQuestSub({
				achieved: true,
				timeAchieved: 2000,
			}),
			mkQuestSub({
				achieved: false,
				lastInteraction: 1000,
				questID: "not_achieved_quest",
			}),
		]);

		const res = await mockApi.get("/api/v1/users/1/games/iidx/SP/targets/recently-raised");

		t.equal(res.statusCode, 200);

		t.hasStrict(res.body.body, {
			quests: [{ questID: "not_achieved_quest" }],
			goals: [{ goalID: "not_achieved_goal" }],
			goalSubs: [{ goalID: "not_achieved_goal" }],
			questSubs: [{ questID: "not_achieved_quest" }],
			user: { id: 1 },
		});

		t.end();
	});

	t.end();
});
