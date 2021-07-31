import { GetGameConfig } from "tachi-common";
import t from "tap";
import { ServerTypeInfo } from "lib/setup/config";
import { CloseAllConnections } from "test-utils/close-connections";
import mockApi from "test-utils/mock-api";

t.test("GET /api/v1/games", async (t) => {
	// lets just run some basic tests that this contains all of our supported games
	// and also returns configs properly.
	const res = await mockApi.get("/api/v1/games");

	t.strictSame(res.body.body.supportedGames, ServerTypeInfo.supportedGames);

	t.strictSame(res.body.body.configs.iidx, GetGameConfig("iidx"));
	t.equal(Object.keys(res.body.body.configs).length, ServerTypeInfo.supportedGames.length);

	t.end();
});

t.teardown(CloseAllConnections);
