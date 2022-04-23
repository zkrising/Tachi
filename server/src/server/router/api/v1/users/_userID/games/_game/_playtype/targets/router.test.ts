import dm from "deepmerge";
import db from "external/mongo/db";
import {
	GoalDocument,
	GoalSubscriptionDocument,
	MilestoneDocument,
	MilestoneSubscriptionDocument,
} from "tachi-common";
import t from "tap";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import {
	HC511Goal,
	HC511UserGoal,
	TestingIIDXSPMilestone,
	TestingIIDXSPMilestoneSub,
} from "test-utils/test-data";

function mkGoalSub(merge: Partial<GoalSubscriptionDocument>) {
	return dm(HC511UserGoal, merge);
}

function mkGoal(merge: Partial<GoalDocument>) {
	return dm(HC511Goal, merge);
}

function mkMilestone(merge: Partial<MilestoneDocument>) {
	return dm(TestingIIDXSPMilestone, merge);
}

function mkMilestoneSub(merge: Partial<MilestoneSubscriptionDocument>) {
	return dm(TestingIIDXSPMilestoneSub, merge);
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

		await db.milestones.insert([
			mkMilestone({}),
			mkMilestone({
				milestoneID: "not_achieved_milestone",
			}),
		]);

		await db["milestone-subs"].insert([
			mkMilestoneSub({
				achieved: true,
				timeAchieved: 2000,
			}),
			mkMilestoneSub({
				achieved: false,
				milestoneID: "not_achieved_milestone",
			}),
		]);

		const res = await mockApi.get("/api/v1/users/1/games/iidx/SP/targets/recently-achieved");

		t.equal(res.statusCode, 200);

		t.hasStrict(res.body.body, {
			milestones: [{ milestoneID: "example_milestone_id" }],
			goals: [{ goalID: "achieved_goal" }],
			goalSubs: [{ goalID: "achieved_goal" }],
			milestoneSubs: [{ milestoneID: "example_milestone_id" }],
			user: { id: 1 },
		});

		t.equal(res.body.body.goals.length, 1);
		t.equal(res.body.body.milestones.length, 1);
		t.equal(res.body.body.goalSubs.length, 1);
		t.equal(res.body.body.milestoneSubs.length, 1);

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

		await db.milestones.insert([
			mkMilestone({}),
			mkMilestone({
				milestoneID: "not_achieved_milestone",
			}),
		]);

		await db["milestone-subs"].insert([
			mkMilestoneSub({
				achieved: true,
				timeAchieved: 2000,
			}),
			mkMilestoneSub({
				achieved: false,
				lastInteraction: 1000,
				milestoneID: "not_achieved_milestone",
			}),
		]);

		const res = await mockApi.get("/api/v1/users/1/games/iidx/SP/targets/recently-raised");

		t.equal(res.statusCode, 200);

		t.hasStrict(res.body.body, {
			milestones: [{ milestoneID: "not_achieved_milestone" }],
			goals: [{ goalID: "not_achieved_goal" }],
			goalSubs: [{ goalID: "not_achieved_goal" }],
			milestoneSubs: [{ milestoneID: "not_achieved_milestone" }],
			user: { id: 1 },
		});

		t.end();
	});

	t.end();
});
