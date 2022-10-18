import dm from "deepmerge";
import db from "external/mongo/db";
import t from "tap";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import {
	FakeOtherUser,
	IIDXSPQuestGoals,
	IIDXSPQuestGoalSubs,
	TestingIIDXSPQuest,
	TestingIIDXSPQuestSub,
	TestingIIDXSPScorePB,
} from "test-utils/test-data";
import type { QuestDocument, QuestlineDocument, QuestSubscriptionDocument } from "tachi-common";

t.test("GET /api/v1/games/:game/:playtype/targets/quests", (t) => {
	t.beforeEach(ResetDBState);

	function mkQuest(merge: any) {
		return dm(TestingIIDXSPQuest, merge) as QuestDocument;
	}

	t.test("Should search quests.", async (t) => {
		await db.quests.insert([
			mkQuest({ name: "Testing Set", questID: "name" }),
			mkQuest({ name: "Testing Other Set", questID: "similar_name" }),
			mkQuest({ name: "Different Name", questID: "radically_different_name" }),
			mkQuest({
				game: "chunithm",
				playtype: "Single",
				questID: "matching name but different gpt",
			}),
			mkQuest({ playtype: "DP", questID: "matching name but different playtype" }),
		]);

		const res = await mockApi.get("/api/v1/games/iidx/SP/targets/quests?search=Testing");

		t.equal(res.statusCode, 200);

		t.hasStrict(
			(res.body.body as Array<QuestDocument>).sort((a, b) => a.name.localeCompare(b.name)),
			[{ questID: "similar_name" }, { questID: "name" }]
		);

		t.end();
	});

	t.end();
});

// this is my lazy sample data for these tests.
const LoadLazySampleData = async () => {
	await db.users.insert(FakeOtherUser);
	await db.goals.insert(IIDXSPQuestGoals);
	await db.quests.insert([
		TestingIIDXSPQuest,
		dm(TestingIIDXSPQuest, { questID: "other_quest" }) as QuestDocument,
	]);
	await db["quest-subs"].insert([
		TestingIIDXSPQuestSub,
		dm(TestingIIDXSPQuestSub, { questID: "other_quest" }),
		dm(TestingIIDXSPQuestSub, {
			userID: 2,
		}),
	] as Array<QuestSubscriptionDocument>);
};

t.test("GET /api/v1/games/:game/:playtype/targets/quests/popular", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(LoadLazySampleData);

	t.test("Should return the most subscribed quests for this GPT.", async (t) => {
		const res = await mockApi.get("/api/v1/games/iidx/SP/targets/quests/popular");

		t.equal(res.statusCode, 200);

		t.hasStrict(
			(res.body.body as Array<QuestDocument>).sort((a, b) => a.name.localeCompare(b.name)),
			[
				{ questID: TestingIIDXSPQuest.questID, __subscriptions: 2 },
				{ questID: "other_quest", __subscriptions: 1 },
			]
		);

		t.end();
	});

	t.end();
});

t.test("GET /api/v1/games/:game/:playtype/targets/quests/:questID", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(async () => {
		await Promise.all([
			db["goal-subs"].insert(IIDXSPQuestGoalSubs),
			db.questlines.insert({
				questlineID: "set_id",
				quests: [TestingIIDXSPQuest.questID],
			} as QuestlineDocument),
		]);
	});

	t.beforeEach(LoadLazySampleData);

	t.test("Should return the quest and its goals.", async (t) => {
		const res = await mockApi.get(
			`/api/v1/games/iidx/SP/targets/quests/${TestingIIDXSPQuest.questID}`
		);

		t.hasStrict(res.body.body, {
			quest: { questID: TestingIIDXSPQuest.questID },
			questSubs: [{ userID: 1, questID: TestingIIDXSPQuest.questID }],
			users: [{ id: 1 }, { id: 2 }],
			goals: [
				{ goalID: "eg_goal_1" },
				{ goalID: "eg_goal_2" },
				{ goalID: "eg_goal_3" },
				{ goalID: "eg_goal_4" },
			],
			parentQuestlines: [{ questlineID: "set_id" }],
		});

		t.end();
	});

	t.test("Should return 404 if the requested quest doesn't exist.", async (t) => {
		const res = await mockApi.get("/api/v1/games/iidx/SP/targets/quests/fake_quest");

		t.equal(res.statusCode, 404);

		t.end();
	});

	t.test("Should return 404 if the quest exists but for a different GPT.", async (t) => {
		const res = await mockApi.get(
			`/api/v1/games/iidx/DP/targets/quests/${TestingIIDXSPQuest.questID}`
		);

		t.equal(res.statusCode, 404);

		t.end();
	});

	t.end();
});

t.test("GET /api/v1/games/:game/:playtype/targets/quests/:questID/evaluate-for", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(LoadLazySampleData);

	t.test("Should evaluate a quest for a user.", async (t) => {
		// remove all quest subs -- the user isn't properly
		// subscribed to this quest due to test mocking.
		// this will force a live calc.
		await db["quest-subs"].remove({});

		await db["personal-bests"].insert(TestingIIDXSPScorePB);

		const res = await mockApi.get(
			`/api/v1/games/iidx/SP/targets/quests/${TestingIIDXSPQuest.questID}/evaluate-for?userID=1`
		);

		t.equal(res.statusCode, 200);

		t.hasStrict(res.body.body, {
			goals: [
				{
					goalID: "eg_goal_1",
				},
				{
					goalID: "eg_goal_2",
				},
				{
					goalID: "eg_goal_3",
				},
				{
					goalID: "eg_goal_4",
				},
			],
			goalResults: [
				{
					achieved: true,
					progress: 6,
					outOf: 5,
					progressHuman: "EX HARD CLEAR (BP: 2)",
					outOfHuman: "HARD CLEAR",
					goalID: "eg_goal_1",
				},
				{
					achieved: true,
					progress: 6,
					outOf: 2,
					progressHuman: "EX HARD CLEAR (BP: 2)",
					outOfHuman: "ASSIST CLEAR",
					goalID: "eg_goal_2",
				},
				{
					achieved: true,
					progress: 1479,
					outOf: 300,
					outOfHuman: "300",
					progressHuman: "1479",
					goalID: "eg_goal_3",
				},
				{
					achieved: true,
					progress: 1479,
					outOf: 1100,
					outOfHuman: "1100",
					progressHuman: "1479",
					goalID: "eg_goal_4",
				},
			],
			achieved: true,
			progress: 4,
			outOf: 4,
		});

		t.end();
	});

	t.test("Should return 404 if the requested quest doesn't exist.", async (t) => {
		const res = await mockApi.get(
			"/api/v1/games/iidx/SP/targets/quests/fake_quest/evaluate-for?userID=1"
		);

		t.equal(res.statusCode, 404);

		t.end();
	});

	t.test("Should return 404 if the quest exists but for a different GPT.", async (t) => {
		const res = await mockApi.get(
			`/api/v1/games/iidx/DP/targets/quests/${TestingIIDXSPQuest.questID}/evaluate-for?userID=1`
		);

		t.equal(res.statusCode, 404);

		t.end();
	});

	t.test("Should return 404 if the requested user doesn't exist.", async (t) => {
		const res = await mockApi.get(
			`/api/v1/games/iidx/SP/targets/quests/${TestingIIDXSPQuest.questID}/evaluate-for?userID=3`
		);

		t.equal(res.statusCode, 404);

		t.end();
	});

	t.test("Should return 400 if the requested user hasn't played this gpt.", async (t) => {
		const res = await mockApi.get(
			`/api/v1/games/iidx/SP/targets/quests/${TestingIIDXSPQuest.questID}/evaluate-for?userID=2`
		);

		t.equal(res.statusCode, 400);

		t.end();
	});

	t.end();
});
