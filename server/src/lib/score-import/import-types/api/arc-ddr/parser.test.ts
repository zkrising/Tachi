import t from "tap";
import { CloseAllConnections } from "../../../../../test-utils/close-connections";
import { agta } from "../../../../../test-utils/misc";
import { MockJSONFetch } from "../../../../../test-utils/mock-fetch";
import ResetDBState from "../../../../../test-utils/resets";
import CreateLogCtx from "../../../../logger/logger";
import { ParseArcDDR } from "./parser";

const logger = CreateLogCtx(__filename);

t.test("#ParseArcDDR", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should iterate over the API.", async (t) => {
		const mockArcAPI = MockJSONFetch({
			"https://arc.example.com/api/v1/ddr/16/player_bests?profile_id=profile": {
				_links: {
					_next: "https://arc.example.com/api/v1/ddr/16/player_bests?profile_id=profile&page=2",
				},
				_items: [1, 2, 3],
			},
			"https://arc.example.com/api/v1/ddr/16/player_bests?profile_id=profile&page=2": {
				_links: {
					_next: null,
				},
				_items: [4, 5, 6],
			},
		});

		const res = ParseArcDDR("profile", logger, mockArcAPI);

		t.equal(res.game, "ddr");
		t.strictSame(res.context, {});
		t.equal(res.classHandler, null);

		const iter = await agta(res.iterable);

		t.strictSame(iter, [1, 2, 3, 4, 5, 6]);

		t.end();
	});

	t.end();
});

t.teardown(CloseAllConnections);
