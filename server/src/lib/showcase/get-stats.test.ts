import t from "tap";
import db from "external/mongo/db";

import ResetDBState from "test-utils/resets";
import { TestingIIDXFolderSP10, Testing511SPA, TestingIIDXSPScorePB } from "test-utils/test-data";
import { IIDX_LAMPS } from "lib/constants/game";
import { EvaluateUsersStatsShowcase } from "./get-stats";
import deepmerge from "deepmerge";
import { CreateFolderChartLookup } from "utils/folder";

t.test("#EvalulateUsersStatsShowcase", (t) => {
	t.beforeEach(ResetDBState);

	t.beforeEach(async () => {
		await db.folders.insert(TestingIIDXFolderSP10);
		await CreateFolderChartLookup(TestingIIDXFolderSP10);

		await db["game-settings"].remove({});

		await db["game-settings"].insert({
			userID: 1,
			game: "iidx",
			playtype: "SP",
			preferences: {
				preferredProfileAlg: null,
				preferredScoreAlg: null,
				preferredSessionAlg: null,
				stats: [
					{
						folderID: TestingIIDXFolderSP10.folderID,
						mode: "folder",
						property: "lamp",
						gte: IIDX_LAMPS.HARD_CLEAR,
					},
					{
						chartID: Testing511SPA.chartID,
						mode: "chart",
						property: "score",
					},
				],
			},
		});

		await db["personal-bests"].insert(deepmerge(TestingIIDXSPScorePB, {}));
	});

	t.test("Should evaluate a user's preferred stats.", async (t) => {
		const res = await EvaluateUsersStatsShowcase(1, "iidx", "SP");

		t.hasStrict(res, [
			{
				stat: { folderID: TestingIIDXFolderSP10.folderID },
				result: {
					value: 1,
					outOf: 1,
				},
				related: {
					folders: [
						{
							folderID: TestingIIDXFolderSP10.folderID,
						},
					],
				},
			},
			{
				stat: { chartID: Testing511SPA.chartID },
				result: {
					value: 1479,
				},
				related: {
					song: {
						title: "5.1.1.",
					},
					chart: {
						difficulty: "ANOTHER",
						playtype: "SP",
					},
				},
			},
		]);

		t.end();
	});

	t.test("Should throw an error if the user does not have game-settings.", async (t) => {
		await db["game-settings"].remove({});

		t.rejects(() => EvaluateUsersStatsShowcase(1, "iidx", "SP"));

		t.end();
	});

	t.test("Should project another users stats onto the given user if set.", async (t) => {
		await db["personal-bests"].insert(
			deepmerge(TestingIIDXSPScorePB, {
				userID: 2,
				scoreData: {
					score: 300,
					lampIndex: IIDX_LAMPS.CLEAR,
				},
			})
		);

		const res = await EvaluateUsersStatsShowcase(2, "iidx", "SP", 1);

		t.hasStrict(res, [
			{
				stat: { folderID: TestingIIDXFolderSP10.folderID },
				result: {
					value: 0,
					outOf: 1,
				},
			},
			{
				stat: { chartID: Testing511SPA.chartID },
				result: {
					value: 300,
				},
			},
		]);

		t.end();
	});

	t.end();
});
