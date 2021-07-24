import deepmerge from "deepmerge";
import t from "tap";
import { EvaluateShowcaseStat } from "./evaluator";
import { CloseAllConnections } from "../../test-utils/close-connections";
import ResetDBState from "../../test-utils/resets";
import {
	Testing511SPA,
	TestingIIDXFolderSP10,
	TestingIIDXSPScorePB,
} from "../../test-utils/test-data";
import { IIDX_LAMPS } from "../constants/game";
import { CreateFolderChartLookup } from "../../utils/folder";
import db from "../../external/mongo/db";

/* eslint-disable no-return-await */
// causes a race condition otherwise due to weird tap interaction

t.beforeEach(ResetDBState);
t.beforeEach(async () => await CreateFolderChartLookup(TestingIIDXFolderSP10));
t.beforeEach(async () => await db["personal-bests"].insert(deepmerge(TestingIIDXSPScorePB, {})));

t.test("#EvaluateShowcaseStat", (t) => {
	t.test("Should evaluate a folder stat.", async (t) => {
		const data = await EvaluateShowcaseStat(
			{
				folderID: TestingIIDXFolderSP10.folderID,
				mode: "folder",
				property: "lamp",
				gte: IIDX_LAMPS.HARD_CLEAR,
			},
			1
		);

		t.strictSame(data, {
			value: 1,
			outOf: 1,
		});

		t.end();
	});

	t.test("Should evaluate a multi-folder stat.", async (t) => {
		const data = await EvaluateShowcaseStat(
			{
				folderID: [TestingIIDXFolderSP10.folderID],
				mode: "folder",
				property: "lamp",
				gte: IIDX_LAMPS.HARD_CLEAR,
			},
			1
		);

		t.strictSame(data, {
			value: 1,
			outOf: 1,
		});

		t.end();
	});

	t.test("Should evaluate a chart stat.", async (t) => {
		const data = await EvaluateShowcaseStat(
			{
				chartID: Testing511SPA.chartID,
				mode: "chart",
				property: "score",
			},
			1
		);

		t.strictSame(data, {
			value: 1479,
		});

		t.end();
	});

	t.test("Should return null if the user has no score on this chart.", async (t) => {
		const data = await EvaluateShowcaseStat(
			{
				chartID: "nonsense",
				mode: "chart",
				property: "score",
			},
			1
		);

		t.strictSame(data, {
			value: null,
		});

		t.end();
	});

	t.end();
});

t.teardown(CloseAllConnections);
