import t from "tap";

import { agta } from "test-utils/misc";
import { MockJSONFetch } from "test-utils/mock-fetch";
import ResetDBState from "test-utils/resets";
import CreateLogCtx from "lib/logger/logger";
import { ParseArcIIDX } from "./parser";
import db from "external/mongo/db";

const logger = CreateLogCtx(__filename);

t.test("#ParseArcIIDX", (t) => {
	t.beforeEach(ResetDBState);

	const mockArcAPI = MockJSONFetch({
		"https://arc.example.com/api/v1/iidx/27/player_bests?profile_id=profile": {
			_links: {
				_next: "https://arc.example.com/api/v1/iidx/27/player_bests?profile_id=profile&page=2",
			},
			_items: [1, 2, 3],
		},
		"https://arc.example.com/api/v1/iidx/27/player_bests?profile_id=profile&page=2": {
			_links: {
				_next: null,
			},
			_items: [4, 5, 6],
		},
	});

	t.test("Should iterate over the API.", async (t) => {
		await db["arc-saved-profiles"].insert({
			userID: 1,
			accountID: "profile",
			forImportType: "api/arc-iidx",
		});

		const res = await ParseArcIIDX(1, logger, mockArcAPI);

		t.equal(res.game, "iidx");
		t.strictSame(res.context, {});

		const iter = await agta(res.iterable);

		t.strictSame(iter, [1, 2, 3, 4, 5, 6]);

		t.end();
	});

	t.test("Should throw a fatal error if no saved profile exists for this user.", async (t) => {
		t.rejects(() => ParseArcIIDX(1, logger, mockArcAPI), {
			message: /No authentication was stored for api\/arc-iidx/iu,
		});

		await db["arc-saved-profiles"].insert({
			userID: 1,
			accountID: "profile",
			forImportType: "api/arc-sdvx",
		});

		t.rejects(() => ParseArcIIDX(1, logger, mockArcAPI), {
			message: /No authentication was stored for api\/arc-iidx/iu,
		});

		t.end();
	});

	t.end();
});
