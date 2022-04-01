import dm from "deepmerge";
import db from "external/mongo/db";
import { GoalSubscriptionDocument } from "tachi-common";
import t from "tap";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import { HC511UserGoal } from "test-utils/test-data";

t.test("GET /api/v1/games/:game/:playtype/targets/recently-achieved", (t) => {
	t.beforeEach(ResetDBState);

	// mutate
	function m(partial: Partial<GoalSubscriptionDocument>): GoalSubscriptionDocument {
		return dm(HC511UserGoal, partial);
	}

	t.test("Should return some recently achieved goals.", async (t) => {
		await db["goal-subs"].insert([
			// not achieved
			HC511UserGoal,
			m({ goalID: "achieved", achieved: true, timeAchieved: 1000 }),
			m({ goalID: "achieved_more_recently", achieved: true, timeAchieved: 2000 }),
			m({
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

t.test("GET /api/v1/games/:game/:playtype/targets/recently-interacted", (t) => {
	t.beforeEach(ResetDBState);

	// mutate
	function m(partial: Partial<GoalSubscriptionDocument>): GoalSubscriptionDocument {
		return dm(HC511UserGoal, partial);
	}

	t.test("Should return some recently interacted goals.", async (t) => {
		await db["goal-subs"].insert([
			// not achieved
			HC511UserGoal,
			m({ goalID: "interacted", achieved: false, lastInteraction: 1000 }),
			m({ goalID: "interacted_more_recently", achieved: true, lastInteraction: 2000 }),
			m({
				goalID: "achieved_instantly",
				achieved: true,
				lastInteraction: 1000,
				wasInstantlyAchieved: true,
			}),
		]);

		const res = await mockApi.get("/api/v1/games/iidx/SP/targets/recently-interacted");

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
