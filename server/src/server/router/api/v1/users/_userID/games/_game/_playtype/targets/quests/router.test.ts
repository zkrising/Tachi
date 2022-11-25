import db from "external/mongo/db";
import t from "tap";
import { CreateFakeAuthCookie } from "test-utils/fake-auth";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import {
	HC511Goal,
	IIDXSPQuestGoals,
	IIDXSPQuestGoalSubs,
	TestingIIDXSPQuest,
	TestingIIDXSPQuestSub,
} from "test-utils/test-data";
import type { UserDocument, UserGameStats } from "tachi-common";

t.test("GET /api/v1/users/:userID/games/:game/:playtype/targets/quests", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should return all quest subscriptions.", async (t) => {
		await db.quests.insert(TestingIIDXSPQuest);
		await db["quest-subs"].insert(TestingIIDXSPQuestSub);
		await db.goals.insert(IIDXSPQuestGoals);

		const res = await mockApi.get("/api/v1/users/1/games/iidx/SP/targets/quests");

		delete TestingIIDXSPQuest._id;
		delete TestingIIDXSPQuestSub._id;

		for (const goal of IIDXSPQuestGoals) {
			delete goal._id;
		}

		t.strictSame(res.body.body, {
			quests: [TestingIIDXSPQuest],
			questSubs: [TestingIIDXSPQuestSub],
			goals: IIDXSPQuestGoals,
		});

		t.end();
	});

	t.test("Should panic if quest subs are parentless.", async (t) => {
		// await db.quests.insert(TestingIIDXSPQuest);
		await db["quest-subs"].insert(TestingIIDXSPQuestSub);

		const res = await mockApi.get("/api/v1/users/1/games/iidx/SP/targets/quests");

		t.equal(res.statusCode, 500);

		t.end();
	});

	t.end();
});

t.test("GET /api/v1/users/:userID/games/:game/:playtype/targets/quests/:questID", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should return the user's specific quest sub.", async (t) => {
		await db.quests.insert(TestingIIDXSPQuest);
		await db["quest-subs"].insert(TestingIIDXSPQuestSub);

		await db.goals.insert(IIDXSPQuestGoals);
		await db["goal-subs"].insert(IIDXSPQuestGoalSubs);

		const res = await mockApi.get(
			`/api/v1/users/1/games/iidx/SP/targets/quests/${TestingIIDXSPQuest.questID}`
		);

		// i hate the fact that monk just adds this to objects! terrible.
		delete TestingIIDXSPQuest._id;
		delete TestingIIDXSPQuestSub._id;

		for (const goal of IIDXSPQuestGoals) {
			delete goal._id;
		}

		t.strictSame(res.body.body, {
			quest: TestingIIDXSPQuest,
			questSub: TestingIIDXSPQuestSub,
			results: IIDXSPQuestGoalSubs.map((e) => ({
				achieved: e.achieved,
				progress: e.progress,
				progressHuman: e.progressHuman,
				outOf: e.outOf,
				outOfHuman: e.outOfHuman,
				goalID: e.goalID,
			})),
			goals: IIDXSPQuestGoals,
		});

		t.end();
	});

	t.test("Should return 404 if the user is not subscribed to this quest.", async (t) => {
		const res = await mockApi.get(`/api/v1/users/1/games/iidx/SP/targets/quests/fake_quest`);

		t.equal(res.statusCode, 404);

		t.end();
	});

	t.end();
});

t.test("PUT /api/v1/users/:userID/games/:game/:playtype/targets/quests/:questID", async (t) => {
	t.beforeEach(ResetDBState);

	const cookie = await CreateFakeAuthCookie(mockApi);

	t.test("Should return 404 if this quest doesn't exist.", async (t) => {
		const res = await mockApi
			.put(`/api/v1/users/1/games/iidx/SP/targets/quests/fake_quest`)
			.set("Cookie", cookie);

		t.equal(res.statusCode, 404);

		t.end();
	});

	t.test("Should return 409 if user is already subscribed to this quest.", async (t) => {
		await db.quests.insert(TestingIIDXSPQuest);
		await db["quest-subs"].insert(TestingIIDXSPQuestSub);

		const res = await mockApi
			.put(`/api/v1/users/1/games/iidx/SP/targets/quests/${TestingIIDXSPQuest.questID}`)
			.set("Cookie", cookie);

		t.equal(res.statusCode, 409);

		t.end();
	});

	t.test("Should subscribe to a quest.", async (t) => {
		await db.quests.insert(TestingIIDXSPQuest);
		await db.goals.insert(IIDXSPQuestGoals);

		const res = await mockApi
			.put(`/api/v1/users/1/games/iidx/SP/targets/quests/${TestingIIDXSPQuest.questID}`)
			.set("Cookie", cookie);

		t.equal(res.statusCode, 200);

		const dbRes = await db["quest-subs"].findOne({
			userID: 1,
			questID: TestingIIDXSPQuest.questID,
		});

		t.not(dbRes, null, "Should have subscribed the user to the quest.");

		t.end();
	});

	t.test("Should return 401 if the user is not authed.", async (t) => {
		const res = await mockApi.put(`/api/v1/users/1/games/iidx/SP/targets/quests/fake_quest`);

		t.equal(res.statusCode, 401);

		t.end();
	});

	t.test("Should return 403 if the user is authed as someone else.", async (t) => {
		// We have to make sure that the user exists, otherwise we'll just get
		// a normal 404.
		await db.users.insert({
			id: 2,
			username: "fake_person",
			usernameLowercase: "fake_person",
		} as UserDocument);

		await db["game-stats"].insert({
			game: "iidx",
			playtype: "SP",
			userID: 2,
		} as UserGameStats);

		const res = await mockApi
			.put(`/api/v1/users/2/games/iidx/SP/targets/quests/fake_quest`)
			.set("Cookie", cookie);

		t.equal(res.statusCode, 403);

		t.end();
	});

	t.end();
});

t.test("DELETE /api/v1/users/:userID/games/:game/:playtype/targets/quests/:questID", async (t) => {
	const cookie = await CreateFakeAuthCookie(mockApi);

	t.test("Should return 404 if the user is not subscribed to this quest.", async (t) => {
		const res = await mockApi
			.delete(`/api/v1/users/1/games/iidx/SP/targets/quests/fake_quest`)
			.set("Cookie", cookie);

		t.equal(res.statusCode, 404);

		t.end();
	});

	t.test("Should return 401 if the user is not authed.", async (t) => {
		const res = await mockApi.delete(`/api/v1/users/1/games/iidx/SP/targets/quests/fake_quest`);

		t.equal(res.statusCode, 401);

		t.end();
	});

	t.test("Should return 403 if the user is authed as someone else.", async (t) => {
		// We have to make sure that the user exists, otherwise we'll just get
		// a normal 404.
		await db.users.insert({
			id: 2,
			username: "fake_person",
			usernameLowercase: "fake_person",
		} as UserDocument);

		await db["game-stats"].insert({
			game: "iidx",
			playtype: "SP",
			userID: 2,
		} as UserGameStats);

		const res = await mockApi
			.delete(`/api/v1/users/2/games/iidx/SP/targets/quests/fake_quest`)
			.set("Cookie", cookie);

		t.equal(res.statusCode, 403);

		t.end();
	});

	t.test("Should unsubscribe from a quest.", async (t) => {
		await db.quests.insert(TestingIIDXSPQuest);
		await db["quest-subs"].insert(TestingIIDXSPQuestSub);

		const res = await mockApi
			.delete(`/api/v1/users/1/games/iidx/SP/targets/quests/${TestingIIDXSPQuest.questID}`)
			.set("Cookie", cookie);

		t.equal(res.statusCode, 200);

		delete TestingIIDXSPQuest._id;
		t.strictSame(res.body.body.quest, TestingIIDXSPQuest);

		const dbRes = await db["quest-subs"].findOne({
			userID: 1,
			questID: TestingIIDXSPQuest.questID,
		});

		t.equal(dbRes, null, "Should have removed the quest from the database.");

		t.end();
	});

	t.end();
});
