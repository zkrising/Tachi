import { TachiConfig } from "lib/setup/config";
import { GetGameConfig } from "tachi-common";
import t from "tap";
import mockApi from "test-utils/mock-api";


t.test("GET /api/v1/games", async (t) => {
	// lets just run some basic tests that this contains all of our supported games
	// and also returns configs properly.
	const res = await mockApi.get("/api/v1/games");

	t.strictSame(res.body.body.supportedGames, TachiConfig.GAMES);

	t.strictSame(res.body.body.configs.iidx, GetGameConfig("iidx"));
	t.equal(Object.keys(res.body.body.configs).length, TachiConfig.GAMES.length);

	t.end();
});
