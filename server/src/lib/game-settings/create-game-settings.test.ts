import t from "tap";
import db from "../../external/mongo/db";
import { CloseAllConnections } from "../../test-utils/close-connections";
import ResetDBState from "../../test-utils/resets";
import { CreateGameSettings } from "./create-game-settings";

t.beforeEach(ResetDBState);

t.test("#CreateGameSettings", (t) => {
	t.test("Should create a new user's settings.", async (t) => {
		await CreateGameSettings(1, "bms", "7K");

		const data = await db["game-settings"].findOne({
			userID: 1,
			game: "bms",
			playtype: "7K",
		});

		t.not(data, null);

		t.end();
	});

	t.test("Should throw an error if the user already has game-settings.", async (t) => {
		await CreateGameSettings(1, "bms", "7K");

		t.rejects(() => CreateGameSettings(1, "bms", "7K"));

		t.end();
	});

	t.end();
});

t.teardown(CloseAllConnections);
