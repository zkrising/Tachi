import t from "tap";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import ResetDBState from "test-utils/resets";
import { EvaluateGoalForUser, HumaniseGoalProgress } from "./goals";
import { GoalDocument } from "tachi-common";
import deepmerge from "deepmerge";
import {
	HC511Goal,
	Testing511SPA,
	TestingIIDXFolderSP10,
	TestingIIDXSPScorePB,
} from "test-utils/test-data";
import { CreateFolderChartLookup } from "utils/folder";

import { Random20Hex } from "utils/misc";

const logger = CreateLogCtx(__filename);

t.test("#EvaluateGoalForUser", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should correctly evaluate against single goals.", (t) => {
		t.beforeEach(async () => {
			await db["personal-bests"].insert(TestingIIDXSPScorePB);
			delete TestingIIDXSPScorePB._id;
		});

		t.test("Should correctly evaluate goals if user succeeds.", async (t) => {
			const res = await EvaluateGoalForUser(HC511Goal, 1, logger);

			t.strictSame(
				res,
				{
					achieved: true,
					outOf: 5,
					progress: 6,
					outOfHuman: "HARD CLEAR",
					progressHuman: "EX HARD CLEAR (BP: 2)",
				},
				"Should correctly evaluate the goal if the user succeeds."
			);

			t.end();
		});

		t.test("Should correctly evaluate goals if user fails.", async (t) => {
			await db["personal-bests"].update(
				{ userID: 1, chartID: Testing511SPA.chartID },
				{
					$set: {
						"scoreData.lamp": "CLEAR",
						"scoreData.lampIndex": 4,
					},
				}
			);

			const res = await EvaluateGoalForUser(HC511Goal, 1, logger);

			t.strictSame(
				res,
				{
					achieved: false,
					outOf: 5,
					progress: 4,
					outOfHuman: "HARD CLEAR",
					progressHuman: "CLEAR (BP: 2)",
				},
				"Should correctly evaluate the goal if the user fails."
			);

			t.end();
		});

		t.test("Should correctly evaluate goals when user has no score.", async (t) => {
			await db["personal-bests"].remove({});

			const res = await EvaluateGoalForUser(HC511Goal, 1, logger);

			t.strictSame(
				res,
				{
					achieved: false,
					outOf: 5,
					progress: null,
					outOfHuman: "HARD CLEAR",
					progressHuman: "NO DATA",
				},
				"Should correctly evaluate the goal if the user has no score."
			);

			t.end();
		});

		t.end();
	});

	t.test("Should correctly evaluate against multi goals.", (t) => {
		// @ts-expect-error ???
		// this goal is effectively "HC any of the charts"
		const multiGoal: GoalDocument = deepmerge(HC511Goal, {
			charts: {
				type: "multi",
				data: [Testing511SPA.chartID, "fake_other_chart_id"],
			},
		});

		t.beforeEach(async () => {
			await db["personal-bests"].insert(TestingIIDXSPScorePB);
			delete TestingIIDXSPScorePB._id;

			await db["personal-bests"].insert(
				deepmerge(TestingIIDXSPScorePB, {
					scoreData: { lamp: "CLEAR", lampIndex: 4 },
					chartID: "fake_other_chart_id",
				})
			);
		});

		t.test("Should work if 511 is >= HARD CLEAR", async (t) => {
			const res = await EvaluateGoalForUser(multiGoal, 1, logger);

			t.strictSame(
				res,
				{
					achieved: true,
					outOf: 5,
					progress: 6,
					outOfHuman: "HARD CLEAR",
					progressHuman: "EX HARD CLEAR (BP: 2)",
				},
				"Should correctly evaluate the goal if the user succeeds."
			);

			t.end();
		});

		t.test("Should work if other chart is >= HARD CLEAR", async (t) => {
			await db["personal-bests"].update(
				{ userID: 1, chartID: Testing511SPA.chartID },
				{ $set: { "scoreData.lamp": "CLEAR", "scoreData.lampIndex": 4 } }
			);
			await db["personal-bests"].update(
				{ userID: 1, chartID: "fake_other_chart_id" },
				{ $set: { "scoreData.lamp": "HARD CLEAR", "scoreData.lampIndex": 5 } }
			);

			const res = await EvaluateGoalForUser(multiGoal, 1, logger);

			t.strictSame(
				res,
				{
					achieved: true,
					outOf: 5,
					progress: 5,
					outOfHuman: "HARD CLEAR",
					progressHuman: "HARD CLEAR (BP: 2)",
				},
				"Should correctly evaluate the goal if the user succeeds."
			);

			t.end();
		});

		t.test("Should work if user has no scores", async (t) => {
			await db["personal-bests"].remove({});

			const res = await EvaluateGoalForUser(multiGoal, 1, logger);

			t.strictSame(
				res,
				{
					achieved: false,
					outOf: 5,
					progress: null,
					outOfHuman: "HARD CLEAR",
					progressHuman: "NO DATA",
				},
				"Should correctly evaluate the goal if the user has no data."
			);

			t.end();
		});

		t.end();
	});

	t.test("Should correctly evaluate against folder goals.", (t) => {
		// @ts-expect-error ???
		// this goal is effectively "HC any of the sp10s"
		const folderGoal: GoalDocument = deepmerge(HC511Goal, {
			charts: {
				type: "folder",
				data: "ed9d8c734447ce67d7135c0067441a98cc81aeaf",
			},
		});

		t.beforeEach(async () => {
			await db["personal-bests"].insert(TestingIIDXSPScorePB);
			delete TestingIIDXSPScorePB._id;

			await db["personal-bests"].insert(
				deepmerge(TestingIIDXSPScorePB, {
					scoreData: { lamp: "CLEAR", lampIndex: 4 },
					chartID: "other_sp10",
				})
			);

			delete Testing511SPA._id;

			await db.charts.iidx.insert([
				deepmerge(Testing511SPA, {
					songID: 123,
					level: "9",
					chartID: "not_sp10",
					data: {
						arcChartID: Random20Hex(),
					},
				}),
				deepmerge(Testing511SPA, {
					songID: 124,
					level: "10",
					chartID: "other_sp10",
					data: {
						arcChartID: Random20Hex(),
					},
				}),
			]);

			await CreateFolderChartLookup(TestingIIDXFolderSP10);
		});

		t.test("Should work if 511 is >= HARD CLEAR", async (t) => {
			const res = await EvaluateGoalForUser(folderGoal, 1, logger);

			t.strictSame(
				res,
				{
					achieved: true,
					outOf: 5,
					progress: 6,
					outOfHuman: "HARD CLEAR",
					progressHuman: "EX HARD CLEAR (BP: 2)",
				},
				"Should correctly evaluate the goal if the user succeeds."
			);

			t.end();
		});

		t.test("Should work if other chart is >= HARD CLEAR", async (t) => {
			await db["personal-bests"].update(
				{ userID: 1, chartID: Testing511SPA.chartID },
				{ $set: { "scoreData.lamp": "CLEAR", "scoreData.lampIndex": 4 } }
			);

			await db["personal-bests"].update(
				{ userID: 1, chartID: "other_sp10" },
				{ $set: { "scoreData.lamp": "HARD CLEAR", "scoreData.lampIndex": 5 } }
			);

			const res = await EvaluateGoalForUser(folderGoal, 1, logger);

			t.strictSame(
				res,
				{
					achieved: true,
					outOf: 5,
					progress: 5,
					outOfHuman: "HARD CLEAR",
					progressHuman: "HARD CLEAR (BP: 2)",
				},
				"Should correctly evaluate the goal if the user succeeds."
			);

			t.end();
		});

		t.test("Should work if user has no scores", async (t) => {
			await db["personal-bests"].remove({});

			const res = await EvaluateGoalForUser(folderGoal, 1, logger);

			t.strictSame(
				res,
				{
					achieved: false,
					outOf: 5,
					progress: null,
					outOfHuman: "HARD CLEAR",
					progressHuman: "NO DATA",
				},
				"Should correctly evaluate the goal if the user has no data."
			);

			t.end();
		});

		t.end();
	});

	t.end();
});

t.test("#HumaniseGoalProgress", (t) => {
	t.equal(HumaniseGoalProgress("iidx", "SP", "scoreData.gradeIndex", 4, null), "B");
	t.equal(HumaniseGoalProgress("iidx", "SP", "scoreData.lampIndex", 4, null), "CLEAR");
	t.equal(HumaniseGoalProgress("iidx", "SP", "scoreData.percent", 90.1142, null), "90.11%");
	t.equal(HumaniseGoalProgress("iidx", "SP", "scoreData.score", 2240, null), "2240");

	t.end();
});
