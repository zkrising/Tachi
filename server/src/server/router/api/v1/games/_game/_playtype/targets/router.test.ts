import db from "external/mongo/db";
import t from "tap";
import { mkFakeGoal, mkFakeGoalSub } from "test-utils/misc";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import { HC511UserGoal } from "test-utils/test-data";
import type { GoalSubscriptionDocument } from "tachi-common";

t.test("GET /api/v1/games/:game/:playtype/targets/recently-achieved", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should return some recently achieved goals.", async (t) => {
		await db.goals.insert([
			mkFakeGoal({ goalID: "achieved" }),
			mkFakeGoal({ goalID: "achieved_more_recently" }),
			mkFakeGoal({ goalID: "achieved_instantly" }),
		]);

		await db["goal-subs"].insert([
			// not achieved
			HC511UserGoal,
			mkFakeGoalSub({ goalID: "achieved", achieved: true, timeAchieved: 1000 }),
			mkFakeGoalSub({ goalID: "achieved_more_recently", achieved: true, timeAchieved: 2000 }),
			mkFakeGoalSub({
				goalID: "achieved_instantly",
				achieved: true,
				timeAchieved: 1000,
				wasInstantlyAchieved: true,
			}),
		]);

		const res = await mockApi.get("/api/v1/games/iidx/SP/targets/recently-achieved");

		t.equal(res.statusCode, 200);

		// Shouldn't have the unachieved goal, shouldn't have the instantly achieved goal.
		// should also have them in the right order.
		t.strictSame(
			res.body.body.goalSubs.map((e: GoalSubscriptionDocument) => e.goalID),
			["achieved_more_recently", "achieved"]
		);

		t.end();
	});

	t.end();
});

t.test("GET /api/v1/games/:game/:playtype/targets/recently-raised", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should return some recently interacted goals.", async (t) => {
		await db.goals.insert([
			mkFakeGoal({ goalID: "interacted" }),
			mkFakeGoal({ goalID: "interacted_more_recently" }),
			mkFakeGoal({ goalID: "achieved" }),
			mkFakeGoal({ goalID: "achieved_instantly" }),
		]);

		await db["goal-subs"].insert([
			// not achieved
			HC511UserGoal,
			mkFakeGoalSub({ goalID: "interacted", achieved: false, lastInteraction: 1000 }),

			// happened more recently
			mkFakeGoalSub({
				goalID: "interacted_more_recently",
				achieved: false,
				lastInteraction: 2000,
			}),

			// shouldnt be included -- just recently-raised.
			mkFakeGoalSub({
				goalID: "achieved",
				achieved: true,
				lastInteraction: 1000,
			}),
			mkFakeGoalSub({
				goalID: "achieved_instantly",
				achieved: true,
				lastInteraction: 1000,
				wasInstantlyAchieved: true,
			}),
		]);

		const res = await mockApi.get("/api/v1/games/iidx/SP/targets/recently-raised");

		t.equal(res.statusCode, 200);

		// Shouldn't have the uninteracted goal, shouldn't have the instantly achieved goal.
		// should also have them in the right order.
		t.strictSame(
			res.body.body.goalSubs.map((e: GoalSubscriptionDocument) => e.goalID),
			["interacted_more_recently", "interacted"]
		);

		t.end();
	});

	t.end();
});
