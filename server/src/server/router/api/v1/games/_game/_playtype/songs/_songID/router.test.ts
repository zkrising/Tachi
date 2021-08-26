import t from "tap";
import { CloseAllConnections } from "test-utils/close-connections";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";
import { LoadTachiIIDXData } from "test-utils/test-data";

t.test("GET /api/v1/games/:game/:playtype/songs/:songID", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(LoadTachiIIDXData);

	t.test("Should return the song at this ID and all of its charts.", async (t) => {
		const res = await mockApi.get("/api/v1/games/iidx/SP/songs/1");

		t.equal(res.body.body.charts.length, 4);

		t.equal(res.body.body.song.id, 1);

		t.end();
	});

	t.test("Should return 404 if this songID does not exist.", async (t) => {
		const res = await mockApi.get("/api/v1/games/iidx/SP/songs/0");

		t.equal(res.statusCode, 404);

		t.end();
	});

	t.test("Should return 400 if songID is not coercible into an integer.", async (t) => {
		const res = await mockApi.get("/api/v1/games/iidx/SP/songs/1.5");

		t.equal(res.statusCode, 400);

		const res2 = await mockApi.get("/api/v1/games/iidx/SP/songs/FOO");

		t.equal(res2.statusCode, 400);

		t.end();
	});

	t.end();
});
