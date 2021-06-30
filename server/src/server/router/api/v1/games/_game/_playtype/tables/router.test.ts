import t from "tap";
import db from "../../../../../../../../external/mongo/db";
import { CloseAllConnections } from "../../../../../../../../test-utils/close-connections";
import mockApi from "../../../../../../../../test-utils/mock-api";
import ResetDBState from "../../../../../../../../test-utils/resets";
import { TestingIIDXFolderSP10 } from "../../../../../../../../test-utils/test-data";
import deepmerge from "deepmerge";
import { FolderDocument } from "tachi-common";

t.test("GET /api/v1/games/:game/:playtype/tables", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should return all folders for this game.", async (t) => {
		const res = await mockApi.get("/api/v1/games/iidx/SP/tables");

		t.equal(res.body.body.length, 1);
		t.equal(res.body.body[0].tableID, "mock_table");

		t.end();
	});

	t.end();
});

t.test("GET /api/v1/games/:game/:playtype/tables/:tableID", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should return the table at this ID and its folders.", async (t) => {
		await db.folders.insert(
			deepmerge(TestingIIDXFolderSP10, { folderID: "testing_folder" }) as FolderDocument
		);

		const res = await mockApi.get("/api/v1/games/iidx/SP/tables/mock_table");

		t.equal(res.body.body.folders.length, 1);
		t.equal(res.body.body.folders[0].folderID, "testing_folder");
		t.equal(res.body.body.table.tableID, "mock_table");

		t.end();
	});

	t.test("Should return 404 if the table does not exist.", async (t) => {
		const res = await mockApi.get("/api/v1/games/iidx/SP/tables/non_existant_table");

		t.equal(res.statusCode, 404);

		t.end();
	});

	t.end();
});

t.teardown(CloseAllConnections);
