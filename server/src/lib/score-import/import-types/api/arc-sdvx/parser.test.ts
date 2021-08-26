import t from "tap";

import { agta } from "test-utils/misc";
import { MockJSONFetch } from "test-utils/mock-fetch";
import ResetDBState from "test-utils/resets";
import CreateLogCtx from "lib/logger/logger";
import { ParseArcSDVX } from "./parser";
import db from "external/mongo/db";

const logger = CreateLogCtx(__filename);

t.test("#ParseArcSDVX", (t) => {
	t.beforeEach(ResetDBState);
	const mockArcAPI = MockJSONFetch({
		"https://arc.example.com/api/v1/sdvx/5/player_bests?profile_id=profile": {
			_links: {
				_next: "https://arc.example.com/api/v1/sdvx/5/player_bests?profile_id=profile&page=2",
			},
			_items: [1, 2, 3],
		},
		"https://arc.example.com/api/v1/sdvx/5/player_bests?profile_id=profile&page=2": {
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
			forImportType: "api/arc-sdvx",
		});

		const res = await ParseArcSDVX(1, logger, mockArcAPI);

		t.equal(res.game, "sdvx");
		t.strictSame(res.context, {});
		t.equal(res.classHandler, null);

		const iter = await agta(res.iterable);

		t.strictSame(iter, [1, 2, 3, 4, 5, 6]);

		t.end();
	});

	t.test("Should throw a fatal error if no saved profile exists for this user.", async (t) => {
		t.rejects(() => ParseArcSDVX(1, logger, mockArcAPI), {
			message: /No authentication was stored for api\/arc-sdvx/iu,
		});

		await db["arc-saved-profiles"].insert({
			userID: 1,
			accountID: "profile",
			forImportType: "api/arc-iidx",
		});

		t.rejects(() => ParseArcSDVX(1, logger, mockArcAPI), {
			message: /No authentication was stored for api\/arc-sdvx/iu,
		});

		t.end();
	});

	t.end();
});
