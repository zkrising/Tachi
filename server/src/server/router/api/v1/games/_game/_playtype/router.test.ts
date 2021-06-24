import t from "tap";
import mockApi from "../../../../../../../test-utils/mock-api";
import { GetGamePTConfig } from "tachi-common";

t.test("GET /api/v1/games/:game/:playtype", (t) => {
	t.test("Should return information about the game:playtype.", async (t) => {
		const res = await mockApi.get("/api/v1/games/iidx/SP");

		t.strictSame(res.body.body.config, GetGamePTConfig("iidx", "SP"));

		// something else needs to go here?

		t.end();
	});

	t.test("Should reject invalid playtypes for this game.", async (t) => {
		const res = await mockApi.get("/api/v1/games/iidx/Single");

		t.equal(res.statusCode, 400);

		t.end();
	});

	t.end();
});
