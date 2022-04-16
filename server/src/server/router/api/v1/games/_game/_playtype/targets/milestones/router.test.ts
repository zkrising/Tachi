import {
	MilestoneDocument,
	MilestoneSetDocument,
	MilestoneSubscriptionDocument,
} from "tachi-common";
import t from "tap";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import dm from "deepmerge";
import {
	FakeOtherUser,
	IIDXSPMilestoneGoals,
	IIDXSPMilestoneGoalSubs,
	TestingIIDXSPMilestone,
	TestingIIDXSPMilestoneSub,
} from "test-utils/test-data";
import db from "external/mongo/db";

t.test("GET /api/v1/games/:game/:playtype/targets/milestones", (t) => {
	t.beforeEach(ResetDBState);

	function mkMilestone(merge: any) {
		return dm(TestingIIDXSPMilestone, merge) as MilestoneDocument;
	}

	t.test("Should search milestones.", async (t) => {
		await db.milestones.insert([
			mkMilestone({ name: "Testing Set", milestoneID: "name" }),
			mkMilestone({ name: "Testing Other Set", milestoneID: "similar_name" }),
			mkMilestone({ name: "Different Name", milestoneID: "radically_different_name" }),
			mkMilestone({
				game: "chunithm",
				playtype: "Single",
				milestoneID: "matching name but different gpt",
			}),
			mkMilestone({ playtype: "DP", milestoneID: "matching name but different playtype" }),
		]);

		const res = await mockApi.get("/api/v1/games/iidx/SP/targets/milestones?search=Testing");

		t.equal(res.statusCode, 200);

		t.hasStrict(
			(res.body.body as MilestoneDocument[]).sort((a, b) => a.name.localeCompare(b.name)),
			[{ milestoneID: "similar_name" }, { milestoneID: "name" }]
		);

		t.end();
	});

	t.end();
});

// this is my lazy sample data for these tests.
const LoadLazySampleData = async () => {
	await db.users.insert(FakeOtherUser);
	await db.goals.insert(IIDXSPMilestoneGoals);
	await db.milestones.insert([
		TestingIIDXSPMilestone,
		dm(TestingIIDXSPMilestone, { milestoneID: "other_milestone" }) as MilestoneDocument,
	]);
	await db["milestone-subs"].insert([
		TestingIIDXSPMilestoneSub,
		dm(TestingIIDXSPMilestoneSub, { milestoneID: "other_milestone" }),
		dm(TestingIIDXSPMilestoneSub, {
			userID: 2,
		}),
	] as MilestoneSubscriptionDocument[]);
};

t.test("GET /api/v1/games/:game/:playtype/targets/milestones/popular", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(LoadLazySampleData);

	t.test("Should return the most subscribed milestones for this GPT.", async (t) => {
		const res = await mockApi.get("/api/v1/games/iidx/SP/targets/milestones/popular");

		t.equal(res.statusCode, 200);

		t.hasStrict(
			(res.body.body as MilestoneDocument[]).sort((a, b) => a.name.localeCompare(b.name)),
			[
				{ milestoneID: TestingIIDXSPMilestone.milestoneID, __subscriptions: 2 },
				{ milestoneID: "other_milestone", __subscriptions: 1 },
			]
		);

		t.end();
	});

	t.end();
});

t.test("GET /api/v1/games/:game/:playtype/targets/milestones/:milestoneID", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(async () => {
		await Promise.all([
			db["goal-subs"].insert(IIDXSPMilestoneGoalSubs),
			db["milestone-sets"].insert({
				setID: "set_id",
				milestones: [TestingIIDXSPMilestone.milestoneID],
			} as MilestoneSetDocument),
		]);
	});

	t.beforeEach(LoadLazySampleData);

	t.test("Should return the milestone and its goals.", async (t) => {
		const res = await mockApi.get(
			`/api/v1/games/iidx/SP/targets/milestones/${TestingIIDXSPMilestone.milestoneID}`
		);

		t.hasStrict(res.body.body, {
			milestone: { milestoneID: TestingIIDXSPMilestone.milestoneID },
			milestoneSubs: [{ userID: 1, milestoneID: TestingIIDXSPMilestone.milestoneID }],
			users: [{ id: 1 }, { id: 2 }],
			goals: [
				{ goalID: "eg_goal_1" },
				{ goalID: "eg_goal_2" },
				{ goalID: "eg_goal_3" },
				{ goalID: "eg_goal_4" },
			],
			parentMilestoneSets: [{ setID: "set_id" }],
		});

		t.end();
	});

	t.test("Should return 404 if the requested milestone doesn't exist.", async (t) => {
		const res = await mockApi.get("/api/v1/games/iidx/SP/targets/milestones/fake_milestone");

		t.equal(res.statusCode, 404);

		t.end();
	});

	t.test("Should return 404 if the milestone exists but for a different GPT.", async (t) => {
		const res = await mockApi.get(
			`/api/v1/games/iidx/DP/targets/milestones/${TestingIIDXSPMilestone.milestoneID}`
		);

		t.equal(res.statusCode, 404);

		t.end();
	});

	t.end();
});

t.test("GET /api/v1/games/:game/:playtype/targets/milestones/:milestoneID/evaluate-for", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(LoadLazySampleData);

	t.test("Should evaluate a milestone for a user.", async (t) => {
		// remove all milestone subs -- the user isn't properly
		// subscribed to this milestone due to test mocking.
		// this will force a live calc.
		await db["milestone-subs"].remove({});

		const res = await mockApi.get(
			`/api/v1/games/iidx/SP/targets/milestones/${TestingIIDXSPMilestone.milestoneID}/evaluate-for?userID=1`
		);

		t.equal(res.statusCode, 200);

		t.strictSame(res.body.body, {
			goals: [
				{
					charts: {
						type: "single",
						data: "c2311194e3897ddb5745b1760d2c0141f933e683",
					},
					game: "iidx",
					goalID: "eg_goal_1",
					playtype: "SP",
					timeAdded: 0,
					name: "HC 5.1.1. SPA",
					criteria: {
						mode: "single",
						value: 5,
						key: "scoreData.lampIndex",
					},
				},
				{
					charts: {
						type: "single",
						data: "c2311194e3897ddb5745b1760d2c0141f933e683",
					},
					game: "iidx",
					goalID: "eg_goal_2",
					playtype: "SP",
					timeAdded: 0,
					name: "HC 5.1.1. SPA",
					criteria: {
						mode: "single",
						value: 2,
						key: "scoreData.lampIndex",
					},
				},
				{
					charts: {
						type: "single",
						data: "c2311194e3897ddb5745b1760d2c0141f933e683",
					},
					game: "iidx",
					goalID: "eg_goal_3",
					playtype: "SP",
					timeAdded: 0,
					name: "HC 5.1.1. SPA",
					criteria: {
						mode: "single",
						value: 300,
						key: "scoreData.lampIndex",
					},
				},
				{
					charts: {
						type: "single",
						data: "c2311194e3897ddb5745b1760d2c0141f933e683",
					},
					game: "iidx",
					goalID: "eg_goal_4",
					playtype: "SP",
					timeAdded: 0,
					name: "HC 5.1.1. SPA",
					criteria: {
						mode: "single",
						value: 1100,
						key: "scoreData.lampIndex",
					},
				},
			],
			goalResults: [
				{
					achieved: false,
					progress: null,
					outOf: 5,
					progressHuman: "NO DATA",
					outOfHuman: "HARD CLEAR",
					goalID: "eg_goal_1",
				},
				{
					achieved: false,
					progress: null,
					outOf: 2,
					progressHuman: "NO DATA",
					outOfHuman: "ASSIST CLEAR",
					goalID: "eg_goal_2",
				},
				{
					achieved: false,
					progress: null,
					outOf: 300,
					progressHuman: "NO DATA",
					goalID: "eg_goal_3",
				},
				{
					achieved: false,
					progress: null,
					outOf: 1100,
					progressHuman: "NO DATA",
					goalID: "eg_goal_4",
				},
			],
			achieved: false,
			progress: 0,
			outOf: 4,
		});

		t.end();
	});

	t.test("Should return 404 if the requested milestone doesn't exist.", async (t) => {
		const res = await mockApi.get(
			"/api/v1/games/iidx/SP/targets/milestones/fake_milestone/evaluate-for?userID=1"
		);

		t.equal(res.statusCode, 404);

		t.end();
	});

	t.test("Should return 404 if the milestone exists but for a different GPT.", async (t) => {
		const res = await mockApi.get(
			`/api/v1/games/iidx/DP/targets/milestones/${TestingIIDXSPMilestone.milestoneID}/evaluate-for?userID=1`
		);

		t.equal(res.statusCode, 404);

		t.end();
	});

	t.test("Should return 404 if the requested user doesn't exist.", async (t) => {
		const res = await mockApi.get(
			`/api/v1/games/iidx/SP/targets/milestones/${TestingIIDXSPMilestone.milestoneID}/evaluate-for?userID=3`
		);

		t.equal(res.statusCode, 404);

		t.end();
	});

	t.test("Should return 400 if the requested user hasn't played this gpt.", async (t) => {
		const res = await mockApi.get(
			`/api/v1/games/iidx/SP/targets/milestones/${TestingIIDXSPMilestone.milestoneID}/evaluate-for?userID=2`
		);

		t.equal(res.statusCode, 400);

		t.end();
	});

	t.end();
});
