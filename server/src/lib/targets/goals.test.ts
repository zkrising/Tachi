import {
	EvaluateGoalForUser,
	GetRelevantFolderGoals,
	GetRelevantGoals,
	HumaniseGoalProgress,
} from "./goals";
import deepmerge from "deepmerge";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { IIDX_GRADES } from "tachi-common";
import t from "tap";
import { mkFakePBIIDXSP } from "test-utils/misc";
import ResetDBState from "test-utils/resets";
import {
	GetKTDataJSON,
	HC511Goal,
	Testing511SPA,
	TestingIIDXFolderSP10,
	TestingIIDXSPScorePB,
} from "test-utils/test-data";
import { CreateFolderChartLookup } from "utils/folder";
import crypto from "crypto";
import type { ChartDocument, GoalDocument, SongDocument } from "tachi-common";

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
					data: {},
				}),
				deepmerge(Testing511SPA, {
					songID: 124,
					level: "10",
					chartID: "other_sp10",
					data: {},
				}),
			]);

			await CreateFolderChartLookup(TestingIIDXFolderSP10, true);
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
	t.test("Should prefer AAA- over AA+ for AAA goals", (t) => {
		t.equal(
			HumaniseGoalProgress(
				"iidx",
				"SP",
				"scoreData.gradeIndex",
				IIDX_GRADES.AAA,
				mkFakePBIIDXSP({
					// @ts-expect-error faulty deepmerge types
					scoreData: {
						score: 1230,
						grade: "AA",
						percent: 78.89,
					},
				})
			),
			"AAA-156"
		);

		t.end();
	});

	t.end();
});

t.test("#GetRelevantFolderGoals", (t) => {
	t.beforeEach(ResetDBState);

	const fakeFolderGoalDocument: GoalDocument = {
		charts: {
			type: "folder",
			data: "ed9d8c734447ce67d7135c0067441a98cc81aeaf",
		},
		game: "iidx",
		goalID: "fake_goal_id",
		playtype: "SP",
		name: "get > 1 ex score on any level 10.",
		criteria: {
			mode: "single",
			value: 1,
			key: "scoreData.score",
		},
	};

	const notFolderGoalDocument: GoalDocument = {
		charts: {
			type: "folder",
			data: "some_fake_folder_id",
		},
		game: "iidx",
		goalID: "fake_bad_goal_id",
		playtype: "SP",
		name: "get > 1 ex score on some other folder.",
		criteria: {
			mode: "single",
			value: 1,
			key: "scoreData.score",
		},
	};

	t.beforeEach(async () => {
		// @ts-expect-error garbage types
		const sp11folder = deepmerge(TestingIIDXFolderSP10, {
			data: { level: "11" },
			folderID: "foo",
		});

		await db.folders.insert(TestingIIDXFolderSP10);
		await db.folders.insert(sp11folder);
		await db.goals.insert(fakeFolderGoalDocument);
		await db.goals.insert(notFolderGoalDocument);
		await CreateFolderChartLookup(TestingIIDXFolderSP10, true);
		await CreateFolderChartLookup(sp11folder, true);
	});

	t.test("Should correctly find the goals on this folder.", async (t) => {
		const res = await GetRelevantFolderGoals(
			["fake_goal_id", "fake_bad_goal_id"],
			[Testing511SPA.chartID]
		);

		t.strictSame(
			res,
			[fakeFolderGoalDocument],
			"Should correctly return only the 511 goal document."
		);

		t.end();
	});

	t.end();
});

t.test("#GetRelevantGoals", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(async () => {
		// use the real data so we have enough charts loaded for this to test properly.
		await db.songs.iidx.remove({});
		await db.charts.iidx.remove({});
		await db.charts.iidx.insert(
			GetKTDataJSON("./tachi/tachi-charts-iidx.json") as Array<
				ChartDocument<"iidx:DP" | "iidx:SP">
			>
		);
		await db.songs.iidx.insert(
			GetKTDataJSON("./tachi/tachi-songs-iidx.json") as Array<SongDocument<"iidx">>
		);

		const lotsOfCharts = await db.charts.iidx.find({}, { limit: 20 });
		const goals: Array<GoalDocument> = lotsOfCharts.map((e) => ({
			charts: {
				type: "single",
				data: e.chartID,
			},
			game: "iidx",
			goalID: crypto.randomBytes(20).toString("hex"),
			playtype: "SP",
			name: "get > 1 ex score on some other folder.",
			criteria: {
				mode: "single",
				value: 1,
				key: "scoreData.score",
			},
		}));

		await db.goals.insert(goals);

		await db["goal-subs"].insert(
			goals.map((e) => ({
				achieved: false,
				wasInstantlyAchieved: false,
				timeAchieved: null,
				game: "iidx",
				playtype: "SP",
				goalID: e.goalID,
				lastInteraction: null,
				outOf: 5,
				outOfHuman: "HARD CLEAR",
				progress: null,
				progressHuman: "NO DATA",
				userID: 1,
				wasAssignedStandalone: false,
			}))
		);
	});

	t.test(
		"Should successfully filter goals to only those that are relevant to the session.",
		async (t) => {
			// lets pretend our session had scores on charts 0->4 and 20->25. We also only have goals on
			// charts 1->20, so only 5 of these should resolve.
			const ourCharts = [
				...(await db.charts.iidx.find({}, { limit: 5 })),
				...(await db.charts.iidx.find({}, { skip: 20, limit: 5 })),
			];

			const chartIDs = new Set(ourCharts.map((e) => e.chartID));

			const res = await GetRelevantGoals("iidx", 1, chartIDs, logger);

			t.equal(res.goals.length, 5, "Should correctly resolve to 5 goals.");
			t.equal(res.goalSubsMap.size, 5, "Should also return 5 goalSubs.");

			t.end();
		}
	);

	t.end();
});
