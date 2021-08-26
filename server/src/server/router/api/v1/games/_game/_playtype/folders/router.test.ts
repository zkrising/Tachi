import t from "tap";
import db from "external/mongo/db";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import deepmerge from "deepmerge";
import { FolderDocument } from "tachi-common";
import { CloseAllConnections } from "test-utils/close-connections";
import { Testing511SPA } from "test-utils/test-data";
import { CreateFolderChartLookup } from "utils/folder";

const mockFolder: FolderDocument = {
	folderID: "foo",
	game: "iidx",
	playtype: "SP",
	title: "12",
	data: {
		level: "10",
	},
	type: "charts",
};

t.test("GET /api/v1/games/:game/:playtype/folders", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should search the folders for this game.", async (t) => {
		await db.folders.insert([
			deepmerge(mockFolder, {}),
			deepmerge(mockFolder, { folderID: "bar", playtype: "DP" }),
			deepmerge(mockFolder, { folderID: "baz", game: "bms" }),
		]);

		const res = await mockApi.get("/api/v1/games/iidx/SP/folders?search=12");

		t.equal(res.body.body.length, 1);
		t.equal(res.body.body[0].folderID, "foo");

		t.end();
	});

	t.test("Should return 400 if no search parameter is given.", async (t) => {
		const res = await mockApi.get("/api/v1/games/iidx/SP/folders");

		t.equal(res.statusCode, 400);

		t.end();
	});

	t.end();
});

t.test("GET /api/v1/games/:game/:playtype/folders/:folderID", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should return the folder at this ID.", async (t) => {
		await db.folders.insert(deepmerge(mockFolder, {}));
		await CreateFolderChartLookup(mockFolder);

		const res = await mockApi.get("/api/v1/games/iidx/SP/folders/foo");

		t.equal(res.body.body.folder.folderID, "foo");
		t.equal(res.body.body.songs.length, 1);
		t.equal(res.body.body.charts.length, 1);
		t.equal(res.body.body.songs[0].id, 1);
		t.equal(res.body.body.charts[0].chartID, Testing511SPA.chartID);

		t.end();
	});

	t.test("Should return 404 if the folder does not exist.", async (t) => {
		const res = await mockApi.get("/api/v1/games/iidx/SP/folders/bar");

		t.equal(res.statusCode, 404);

		t.end();
	});

	t.end();
});

t.test("GET /api/v1/games/:game/:playtype/folders/:folderID/tierlist", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(async () => {
		await db.folders.insert(deepmerge(mockFolder, {}));
		await CreateFolderChartLookup(mockFolder);
	});

	t.test("Should return the songs, charts, folder and tierlist information.", async (t) => {
		const res = await mockApi.get("/api/v1/games/iidx/SP/folders/foo/tierlist?type=lamp");

		t.equal(res.body.body.charts.length, 1);
		t.equal(res.body.body.songs.length, 1);
		t.equal(res.body.body.songs[0].id, 1);
		t.equal(res.body.body.charts[0].chartID, Testing511SPA.chartID);
		t.equal(res.body.body.folder.folderID, "foo");
		t.equal(res.body.body.tierlistData.length, 2);
		t.equal(res.body.body.tierlistData[0].chartID, Testing511SPA.chartID);
		t.equal(res.body.body.tierlistData[1].chartID, Testing511SPA.chartID);
		t.equal(res.body.body.tierlistData[0].type, "lamp");
		t.equal(res.body.body.tierlistData[1].type, "lamp");

		t.end();
	});

	t.test("Should return 404 if the specified tierlistID does not exist.", async (t) => {
		const res = await mockApi.get(
			"/api/v1/games/iidx/SP/folders/foo/tierlist?tierlistID=garbage&type=lamp"
		);

		t.equal(res.statusCode, 404);

		t.end();
	});

	t.test("Should return 501 if the specified game has no default tierlist.", async (t) => {
		await db.tierlists.remove({ game: "iidx", playtype: "SP" });

		const res = await mockApi.get("/api/v1/games/iidx/SP/folders/foo/tierlist?type=lamp");

		t.equal(res.statusCode, 501);

		t.end();
	});

	t.test("Should return 400 if no type is given", async (t) => {
		const res = await mockApi.get("/api/v1/games/iidx/SP/folders/foo/tierlist");

		t.equal(res.statusCode, 400);

		t.end();
	});

	t.test("Should return 400 if an invalid type is given", async (t) => {
		const res = await mockApi.get("/api/v1/games/iidx/SP/folders/foo/tierlist?type=nonsense");

		t.equal(res.statusCode, 400);

		t.end();
	});

	t.end();
});
