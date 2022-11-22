import { ProcessGoal, UpdateGoalsForUser } from "./goals";
import deepmerge from "deepmerge";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import t from "tap";
import ResetDBState from "test-utils/resets";
import {
	HC511Goal,
	HC511UserGoal,
	Testing511SPA,
	TestingIIDXSPScorePB,
} from "test-utils/test-data";
import type { GoalDocument, GoalSubscriptionDocument } from "tachi-common";

const logger = CreateLogCtx(__filename);

t.test("#UpdateGoalsForUser", (t) => {
	t.beforeEach(ResetDBState);

	const baseGoalDocument: GoalDocument = {
		charts: {
			type: "single" as const,
			data: Testing511SPA.chartID,
		},
		game: "iidx",
		goalID: "FAKE_GOAL_ID",
		playtype: "SP",
		timeAdded: 0,
		name: "get > 1 ex score on some other folder.",
		criteria: {
			mode: "single",
			value: 1,
			key: "scoreData.score",
		},
	};

	const baseGoalSubscriptionDocument: GoalSubscriptionDocument = {
		achieved: false,
		wasInstantlyAchieved: false,
		game: "iidx",
		playtype: "SP",
		goalID: "FAKE_GOAL_ID",
		lastInteraction: null,
		outOf: 1,
		outOfHuman: "1",
		progress: 0,
		progressHuman: "0",
		timeAchieved: null,
		timeSet: 0,
		userID: 1,
	};

	t.test("Should correctly update goals when user achieves goal.", async (t) => {
		await db.goals.insert(baseGoalDocument);
		delete baseGoalDocument._id;

		await db["goal-subs"].insert(baseGoalSubscriptionDocument);

		// we dont delete _id here because updategoalsforuser
		// depends on usergoal _id

		await db["personal-bests"].insert(TestingIIDXSPScorePB);
		delete TestingIIDXSPScorePB._id;

		const ugMap = new Map([["FAKE_GOAL_ID", baseGoalSubscriptionDocument]]);

		const res = await UpdateGoalsForUser([baseGoalDocument], ugMap, 1, logger);

		t.strictSame(res, [
			{
				goalID: "FAKE_GOAL_ID",
				old: {
					progress: 0,
					progressHuman: "0",
					outOf: 1,
					outOfHuman: "1",
					achieved: false,
				},
				new: {
					progress: 1479,
					progressHuman: "1479",
					outOf: 1,
					outOfHuman: "1",
					achieved: true,
				},
			},
		]);

		const r = await db["goal-subs"].findOne({ goalID: "FAKE_GOAL_ID", userID: 1 });

		t.hasStrict(
			r,
			{
				progress: 1479,
				progressHuman: "1479",
				outOf: 1,
				outOfHuman: "1",
				achieved: true,
			},
			"Should update goals in the database."
		);

		delete baseGoalSubscriptionDocument._id;

		t.end();
	});

	t.test("Should correctly update goals when user does not achieve goal.", async (t) => {
		const goal = deepmerge(baseGoalDocument, { criteria: { value: 2 } });

		await db.goals.insert(goal);

		const goalSub = deepmerge(baseGoalSubscriptionDocument, {
			outOf: 2,
			outOfHuman: "2",
		}) as unknown as GoalSubscriptionDocument;

		await db["goal-subs"].insert(goalSub);

		// we dont delete _id here because updategoalsforuser
		// depends on usergoal _id

		await db["personal-bests"].insert(
			deepmerge(TestingIIDXSPScorePB, { scoreData: { score: 1 } })
		);

		const ugMap = new Map([["FAKE_GOAL_ID", goalSub]]);

		const res = await UpdateGoalsForUser([goal], ugMap, 1, logger);

		t.strictSame(res, [
			{
				goalID: "FAKE_GOAL_ID",
				old: {
					progress: 0,
					progressHuman: "0",
					outOf: 2,
					outOfHuman: "2",
					achieved: false,
				},
				new: {
					progress: 1,
					progressHuman: "1",
					outOf: 2,
					outOfHuman: "2",
					achieved: false,
				},
			},
		]);

		const r = await db["goal-subs"].findOne({ goalID: "FAKE_GOAL_ID", userID: 1 });

		t.hasStrict(
			r,
			{
				progress: 1,
				progressHuman: "1",
				outOf: 2,
				outOfHuman: "2",
				achieved: false,
			},
			"Should update goals in the database."
		);

		delete baseGoalSubscriptionDocument._id;

		t.end();
	});

	t.test("Should return [] if no data is to be changed.", async (t) => {
		const res = await UpdateGoalsForUser([], new Map(), 1, logger);

		t.strictSame(res, []);

		t.end();
	});

	t.test("Should handle (skip) goals if no usergoal is set.", async (t) => {
		const res = await UpdateGoalsForUser([baseGoalDocument], new Map(), 1, logger);

		t.strictSame(res, []);

		t.end();
	});

	t.test("Should handle (skip) invalid goals.", async (t) => {
		const res = await UpdateGoalsForUser(
			[deepmerge(baseGoalDocument, { charts: { type: "INVALID" } })],
			new Map([["FAKE_GOAL_ID", baseGoalSubscriptionDocument]]),
			1,
			logger
		);

		t.strictSame(res, []);

		t.end();
	});

	t.end();
});

t.todo("#GetAndUpdateUsersGoals", (t) => {
	t.beforeEach(ResetDBState);

	t.end();
});

t.test("#ProcessGoal", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(async () => {
		await db.goals.insert(HC511Goal);
	});

	t.test("Should process the users goal if a score has changed.", async (t) => {
		await db["goal-subs"].insert(HC511UserGoal);

		// score is EX HARD CLEAR by default.
		await db["personal-bests"].insert(TestingIIDXSPScorePB);

		const res = await ProcessGoal(HC511Goal, HC511UserGoal, 1, logger);

		t.not(res, undefined, "Should NOT return undefined.");

		t.strictSame(
			res?.import,
			{
				goalID: "mock_goalID",
				old: {
					progress: null,
					progressHuman: "NO DATA",
					outOf: 5,
					outOfHuman: "HARD CLEAR",
					achieved: false,
				},
				new: {
					progress: 6,
					progressHuman: "EX HARD CLEAR (BP: 2)",
					outOf: 5,
					outOfHuman: "HARD CLEAR",
					achieved: true,
				},
			},
			"Should return a valid import goal fragment."
		);

		t.end();
	});

	t.test("Should unset wasInstantlyAchieved if the goal became unachieved.", async (t) => {
		const achievedGoalSub: GoalSubscriptionDocument = {
			achieved: true,
			game: "iidx",
			goalID: "mock_goalID",
			lastInteraction: null,
			outOf: 5,
			outOfHuman: "HARD CLEAR",
			playtype: "SP",
			progress: 6,
			progressHuman: "EX HARD CLEAR",
			timeAchieved: 1000,
			timeSet: 1000,
			wasInstantlyAchieved: true,
			userID: 1,
		};

		await db["goal-subs"].insert(achievedGoalSub);

		const res = await ProcessGoal(HC511Goal, achievedGoalSub, 1, logger);

		t.not(res, undefined, "Should NOT return undefined.");

		t.hasStrict(
			res?.import,
			{
				goalID: "mock_goalID",
				old: {
					progress: 6,
					outOf: 5,
					achieved: true,
				},
				new: {
					progress: null,
					outOf: 5,
					achieved: false,
				},
			},
			"Should unachieve the goal."
		);

		t.equal(
			res?.bwrite.updateOne.update.$set.wasInstantlyAchieved,
			false,
			"Goal is to be set as not instantly achieved."
		);

		t.end();
	});

	t.test("Should return undefined if there's no score.", async (t) => {
		await db["goal-subs"].insert(HC511UserGoal);

		const res = await ProcessGoal(HC511Goal, HC511UserGoal, 1, logger);

		t.equal(res, undefined, "Should return undefined.");

		t.end();
	});

	t.test("Should return undefined if the progress has not changed.", async (t) => {
		await db["goal-subs"].insert(HC511UserGoal);
		await db["personal-bests"].insert(TestingIIDXSPScorePB);

		const firstUpdate = await ProcessGoal(HC511Goal, HC511UserGoal, 1, logger);

		// ignore this one
		t.not(firstUpdate, undefined, "Should NOT return undefined.");

		await db["goal-subs"].bulkWrite([firstUpdate!.bwrite]);

		const goalSub = await db["goal-subs"].findOne({ userID: 1, goalID: HC511Goal.goalID });

		const secondUpdate = await ProcessGoal(HC511Goal, goalSub!, 1, logger);

		t.equal(secondUpdate, undefined, "Should return undefined.");

		t.end();
	});

	t.end();
});
