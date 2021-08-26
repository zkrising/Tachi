import t from "tap";
import mockApi from "test-utils/mock-api";
import { GetGameConfig } from "tachi-common";
import { CloseAllConnections } from "test-utils/close-connections";

t.test("GET /api/v1/games/:game", (t) => {
	t.test("Should parse the game from the header", async (t) => {
		const res = await mockApi.get("/api/v1/games/iidx");

		t.strictSame(res.body.body, GetGameConfig("iidx"));

		t.end();
	});

	t.test("Should reject an unsupported game.", async (t) => {
		const res = await mockApi.get("/api/v1/games/invalid_game");

		t.equal(res.statusCode, 400);

		t.end();
	});

	t.end();
});
