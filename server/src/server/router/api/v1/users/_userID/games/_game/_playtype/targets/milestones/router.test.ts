import db from "external/mongo/db";
import { PublicUserDocument, UserGameStats } from "tachi-common";
import t from "tap";
import { CreateFakeAuthCookie } from "test-utils/fake-auth";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import {
	IIDXSPMilestoneGoals,
	IIDXSPMilestoneGoalSubs,
	TestingIIDXSPMilestone,
	TestingIIDXSPMilestoneSub,
} from "test-utils/test-data";

t.test("GET /api/v1/users/:userID/games/:game/:playtype/targets/milestones", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should return all milestone subscriptions.", async (t) => {
		await db.milestones.insert(TestingIIDXSPMilestone);
		await db["milestone-subs"].insert(TestingIIDXSPMilestoneSub);

		const res = await mockApi.get("/api/v1/users/1/games/iidx/SP/targets/milestones");

		delete TestingIIDXSPMilestone._id;
		delete TestingIIDXSPMilestoneSub._id;

		t.strictSame(res.body.body, {
			milestones: [TestingIIDXSPMilestone],
			milestoneSubs: [TestingIIDXSPMilestoneSub],
		});

		t.end();
	});

	t.test("Should panic if milestone subs are parentless.", async (t) => {
		// await db.milestones.insert(TestingIIDXSPMilestone);
		await db["milestone-subs"].insert(TestingIIDXSPMilestoneSub);

		const res = await mockApi.get("/api/v1/users/1/games/iidx/SP/targets/milestones");

		t.equal(res.statusCode, 500);

		t.end();
	});

	t.end();
});

t.test("GET /api/v1/users/:userID/games/:game/:playtype/targets/milestones/:milestoneID", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should return the user's specific milestone sub.", async (t) => {
		await db.milestones.insert(TestingIIDXSPMilestone);
		await db["milestone-subs"].insert(TestingIIDXSPMilestoneSub);

		await db.goals.insert(IIDXSPMilestoneGoals);
		await db["goal-subs"].insert(IIDXSPMilestoneGoalSubs);

		const res = await mockApi.get(
			`/api/v1/users/1/games/iidx/SP/targets/milestones/${TestingIIDXSPMilestone.milestoneID}`
		);

		// i hate the fact that monk just adds this to objects! terrible.
		delete TestingIIDXSPMilestone._id;
		delete TestingIIDXSPMilestoneSub._id;

		for (const goal of IIDXSPMilestoneGoals) {
			delete goal._id;
		}

		t.strictSame(res.body.body, {
			milestone: TestingIIDXSPMilestone,
			milestoneSub: TestingIIDXSPMilestoneSub,
			results: IIDXSPMilestoneGoalSubs.map((e) => ({
				achieved: e.achieved,
				progress: e.progress,
				progressHuman: e.progressHuman,
				outOf: e.outOf,
				outOfHuman: e.outOfHuman,
				goalID: e.goalID,
			})),
			goals: IIDXSPMilestoneGoals,
		});

		t.end();
	});

	t.test("Should return 404 if the user is not subscribed to this milestone.", async (t) => {
		const res = await mockApi.get(
			`/api/v1/users/1/games/iidx/SP/targets/milestones/fake_milestone`
		);

		t.equal(res.statusCode, 404);

		t.end();
	});

	t.end();
});

t.test(
	"PUT /api/v1/users/:userID/games/:game/:playtype/targets/milestones/:milestoneID",
	async (t) => {
		t.beforeEach(ResetDBState);

		const cookie = await CreateFakeAuthCookie(mockApi);

		t.test("Should return 404 if this milestone doesn't exist.", async (t) => {
			const res = await mockApi
				.put(`/api/v1/users/1/games/iidx/SP/targets/milestones/fake_milestone`)
				.set("Cookie", cookie);

			t.equal(res.statusCode, 404);

			t.end();
		});

		t.test("Should return 409 if user is already subscribed to this milestone.", async (t) => {
			await db.milestones.insert(TestingIIDXSPMilestone);
			await db["milestone-subs"].insert(TestingIIDXSPMilestoneSub);

			const res = await mockApi
				.put(
					`/api/v1/users/1/games/iidx/SP/targets/milestones/${TestingIIDXSPMilestone.milestoneID}`
				)
				.set("Cookie", cookie);

			t.equal(res.statusCode, 409);

			t.end();
		});

		t.test("Should subscribe to a milestone.", async (t) => {
			await db.milestones.insert(TestingIIDXSPMilestone);
			await db.goals.insert(IIDXSPMilestoneGoals);

			const res = await mockApi
				.put(
					`/api/v1/users/1/games/iidx/SP/targets/milestones/${TestingIIDXSPMilestone.milestoneID}`
				)
				.set("Cookie", cookie);

			t.equal(res.statusCode, 200);

			const dbRes = await db["milestone-subs"].findOne({
				userID: 1,
				milestoneID: TestingIIDXSPMilestone.milestoneID,
			});

			t.not(dbRes, null, "Should have subscribed the user to the milestone.");

			t.end();
		});

		t.test("Should return 401 if the user is not authed.", async (t) => {
			const res = await mockApi.put(
				`/api/v1/users/1/games/iidx/SP/targets/milestones/fake_milestone`
			);

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
			} as PublicUserDocument);

			await db["game-stats"].insert({
				game: "iidx",
				playtype: "SP",
				userID: 2,
			} as UserGameStats);

			const res = await mockApi
				.put(`/api/v1/users/2/games/iidx/SP/targets/milestones/fake_milestone`)
				.set("Cookie", cookie);

			t.equal(res.statusCode, 403);

			t.end();
		});

		t.end();
	}
);

t.test(
	"DELETE /api/v1/users/:userID/games/:game/:playtype/targets/milestones/:milestoneID",
	async (t) => {
		const cookie = await CreateFakeAuthCookie(mockApi);

		t.test("Should return 404 if the user is not subscribed to this milestone.", async (t) => {
			const res = await mockApi
				.delete(`/api/v1/users/1/games/iidx/SP/targets/milestones/fake_milestone`)
				.set("Cookie", cookie);

			t.equal(res.statusCode, 404);

			t.end();
		});

		t.test("Should return 401 if the user is not authed.", async (t) => {
			const res = await mockApi.delete(
				`/api/v1/users/1/games/iidx/SP/targets/milestones/fake_milestone`
			);

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
			} as PublicUserDocument);

			await db["game-stats"].insert({
				game: "iidx",
				playtype: "SP",
				userID: 2,
			} as UserGameStats);

			const res = await mockApi
				.delete(`/api/v1/users/2/games/iidx/SP/targets/milestones/fake_milestone`)
				.set("Cookie", cookie);

			t.equal(res.statusCode, 403);

			t.end();
		});

		t.test("Should unsubscribe from a milestone.", async (t) => {
			await db.milestones.insert(TestingIIDXSPMilestone);
			await db["milestone-subs"].insert(TestingIIDXSPMilestoneSub);

			const res = await mockApi
				.delete(
					`/api/v1/users/1/games/iidx/SP/targets/milestones/${TestingIIDXSPMilestone.milestoneID}`
				)
				.set("Cookie", cookie);

			t.equal(res.statusCode, 200);

			delete TestingIIDXSPMilestone._id;
			t.strictSame(res.body.body.milestone, TestingIIDXSPMilestone);

			const dbRes = await db["milestone-subs"].findOne({
				userID: 1,
				milestoneID: TestingIIDXSPMilestone.milestoneID,
			});

			t.equal(dbRes, null, "Should have removed the milestone from the database.");

			t.end();
		});

		t.end();
	}
);
