import dm from "deepmerge";
import db from "external/mongo/db";
import { ChartDocument } from "tachi-common";
import t from "tap";
import { CreateFakeAuthCookie } from "test-utils/fake-auth";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import {
	HC511Goal,
	HC511UserGoal,
	Testing511SPA,
	TestingIIDXSPMilestone,
} from "test-utils/test-data";

// @ts-expect-error Not sure why the types break here, but they do.
const dupedGoal = dm({}, HC511Goal);
// @ts-expect-error Not sure why the types break here, but they do.
const dupedGoalSub = dm({}, HC511UserGoal);

// having two charts available is useful here for testing multi-chart goals.
const anotherFakeChart = dm(Testing511SPA, {
	chartID: "another_chart",
	difficulty: "HYPER",
	data: {
		arcChartID: null,
	},
}) as ChartDocument;

t.test("GET /api/v1/users/:userID/games/:game/:playtype/targets/goals", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should retrieve this user's goal subscriptions.", async (t) => {
		await db.goals.insert(dupedGoal);
		await db["goal-subs"].insert(dupedGoalSub);

		const res = await mockApi.get("/api/v1/users/1/games/iidx/SP/targets/goals");

		t.equal(res.statusCode, 200);

		t.strictSame(res.body.body, {
			goals: [HC511Goal],
			goalSubs: [HC511UserGoal],
		});

		t.end();
	});

	t.end();
});

t.test("POST /api/v1/users/:userID/games/:game/:playtype/targets/add-goal", async (t) => {
	t.beforeEach(ResetDBState);

	const cookie = await CreateFakeAuthCookie(mockApi);

	const baseInput = {
		criteria: {
			key: "scoreData.percent",
			value: 1,
			mode: "single",
		},
		charts: {
			type: "single",
			data: Testing511SPA.chartID,
		},
	};

	function mkInput(caseName: string, merge: any) {
		return {
			caseName,
			content: dm(baseInput, merge),
		};
	}

	t.test("Should set valid goals.", async (t) => {
		const validInput = [
			mkInput("Base Case", baseInput),
			mkInput("Score:Single Case", {
				criteria: {
					key: "scoreData.score",
					value: 1,
					mode: "",
				},
			}),
		];

		t.end();
	});

	t.test("Should reject invalid goals.", async (t) => {
		await db.charts.iidx.insert(anotherFakeChart);

		const invalidInput = [
			mkInput("negative percent", {
				criteria: {
					value: -1,
				},
			}),
			mkInput("percent of 0 is a non-goal", {
				criteria: {
					value: 0,
				},
			}),
			mkInput("percent greater than 100", {
				criteria: {
					value: 100.1,
				},
			}),
			mkInput("abs without countNum", {
				criteria: {
					mode: "abs",
				},
			}),
			mkInput("proportion without countNum", {
				criteria: {
					mode: "proportion",
				},
			}),
			mkInput("single with countNum", {
				criteria: {
					mode: "single",
					countNum: 123,
				},
			}),
			mkInput("nonsense mode", {
				criteria: {
					mode: "nonsense",
				},
			}),
			mkInput("abs with countNum but charts.type == single", {
				criteria: {
					mode: "abs",
					countNum: 1,
				},
				charts: {
					type: "single",
				},
			}),
			mkInput("nonsense charts.type", {
				charts: {
					type: "nonsense",
				},
			}),
			mkInput("charts.data when type == any", {
				charts: {
					type: "any",
					data: "foo",
				},
			}),
			mkInput("charts.data array when type == single", {
				charts: {
					type: "single",
					data: [Testing511SPA.chartID, Testing511SPA.chartID],
				},
			}),
			mkInput("charts.data array of identical chartIDs", {
				charts: {
					type: "multi",
					data: [Testing511SPA.chartID, Testing511SPA.chartID],
				},
			}),
			mkInput("charts.data array of single chartID", {
				charts: {
					type: "multi",
					data: [Testing511SPA.chartID],
				},
			}),
			mkInput("charts.data array of chartIDs that don't exist", {
				charts: {
					type: "multi",
					data: [Testing511SPA.chartID, "not_exist"],
				},
			}),
			mkInput("charts.data folder refers to folder that doesn't exist", {
				charts: {
					type: "folder",
					data: "fake-folder",
				},
			}),
			mkInput("nonsense charts.data", {
				charts: {
					data: "nonsense",
				},
			}),
			mkInput("multi-score for iidx is illegal", {
				criteria: {
					key: "scoreData.score",
					value: 1,
				},
				charts: {
					type: "multi",
					data: [Testing511SPA.chartID, "another_chart"],
				},
			}),
		];

		for (const input of invalidInput) {
			// eslint-disable-next-line no-await-in-loop
			const res = await mockApi
				.post("/api/v1/users/1/games/iidx/SP/targets/goals/add-goal")
				.set("Cookie", cookie)
				.send(input.content);

			t.equal(res.statusCode, 400);

			t.matchSnapshot(res.body.description, `Invalid Goal: ${input.caseName}`);
		}

		t.end();
	});

	t.end();
});

t.test("GET /api/v1/users/:userID/games/:game/:playtype/targets/goals/:goalID", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should retrieve this user's goal subscription.", async (t) => {
		await db.goals.insert(dupedGoal);
		await db["goal-subs"].insert(dupedGoalSub);

		const res = await mockApi.get(
			`/api/v1/users/1/games/iidx/SP/targets/goals/${HC511Goal.goalID}`
		);

		t.equal(res.statusCode, 200);

		t.hasStrict(res.body.body, {
			goal: HC511Goal,
			goalSub: HC511UserGoal,
			milestones: [],
			user: {
				id: 1,
			},
		});

		t.end();
	});

	t.test("Should return parent milestones if goal has any.", async (t) => {
		await db.goals.insert(dupedGoal);
		await db["goal-subs"].insert(
			// @ts-expect-error Not sure why the types break here, but they do.
			dm(HC511UserGoal, {
				parentMilestones: [TestingIIDXSPMilestone.milestoneID],
			})
		);
		await db.milestones.insert(dm(TestingIIDXSPMilestone, {}));

		const res = await mockApi.get(
			`/api/v1/users/1/games/iidx/SP/targets/goals/${HC511Goal.goalID}`
		);

		t.equal(res.statusCode, 200);

		t.hasStrict(res.body.body, {
			goal: HC511Goal,
			goalSub: HC511UserGoal,
			milestones: [TestingIIDXSPMilestone],
			user: {
				id: 1,
			},
		});

		t.end();
	});

	t.test("Should panic if goal refers to a parent milestone that doesn't exist.", async (t) => {
		await db.goals.insert(dupedGoal);
		await db["goal-subs"].insert(
			// @ts-expect-error Not sure why the types break here, but they do.
			dm(HC511UserGoal, {
				parentMilestones: [TestingIIDXSPMilestone.milestoneID],
			})
		);

		const res = await mockApi.get(
			`/api/v1/users/1/games/iidx/SP/targets/goals/${HC511Goal.goalID}`
		);

		t.equal(res.statusCode, 500);

		t.end();
	});

	t.test("Should return 404 if the user is not subscribed to this goal ID.", async (t) => {
		const res = await mockApi.get(`/api/v1/users/1/games/iidx/SP/targets/goals/INVALID_GOAL`);

		t.equal(res.statusCode, 404);

		t.end();
	});

	t.end();
});

t.test("DELETE /api/v1/users/:userID/games/:game/:playtype/targets/goals/:goalID", async (t) => {
	t.beforeEach(ResetDBState);

	const cookie = await CreateFakeAuthCookie(mockApi);

	t.test("Should delete a goal subscription if subscribed.", async (t) => {
		await db.goals.insert(dupedGoal);
		await db["goal-subs"].insert(dupedGoalSub);

		const res = await mockApi
			.delete(`/api/v1/users/1/games/iidx/SP/targets/goals/${dupedGoalSub.goalID}`)
			.set("Cookie", cookie);

		t.equal(res.statusCode, 200);

		const dbRes = await db["goal-subs"].findOne({
			userID: 1,
			goalID: dupedGoal.goalID,
		});

		t.equal(dbRes, null, "Should delete the goal sub from the database.");

		t.end();
	});

	t.test("Should reject a goal deletion if goal has parent milestones.", async (t) => {
		await db.goals.insert(dupedGoal);
		await db["goal-subs"].insert(
			// @ts-expect-error deepmerge type error
			dm(dupedGoalSub, {
				parentMilestones: [TestingIIDXSPMilestone.milestoneID],
			})
		);

		const res = await mockApi
			.delete(`/api/v1/users/1/games/iidx/SP/targets/goals/${dupedGoalSub.goalID}`)
			.set("Cookie", cookie);

		t.equal(res.statusCode, 400);
		t.equal(
			res.body.description,
			"This goal is part of a milestone you are subscribed to. It can only be removed by unsubscribing from the relevant milestones."
		);

		const dbRes = await db["goal-subs"].findOne({
			userID: 1,
			goalID: dupedGoal.goalID,
		});

		t.not(dbRes, null, "Should NOT delete the goal sub from the database.");

		t.end();
	});

	t.test("Should reject a goal deletion if not subscribed.", async (t) => {
		await db.goals.insert(dupedGoal);
		await db["goal-subs"].insert(dupedGoalSub);

		const res = await mockApi
			.delete(`/api/v1/users/1/games/iidx/SP/targets/goals/INVALID_GOAL`)
			.set("Cookie", cookie);

		t.equal(res.statusCode, 404);

		t.end();
	});

	t.test("Should reject a goal deletion if not authed.", async (t) => {
		await db.goals.insert(dupedGoal);
		await db["goal-subs"].insert(dupedGoalSub);

		const res = await mockApi.delete(
			`/api/v1/users/1/games/iidx/SP/targets/goals/${dupedGoalSub.goalID}`
		);

		t.equal(res.statusCode, 401);

		t.end();
	});

	t.end();
});
