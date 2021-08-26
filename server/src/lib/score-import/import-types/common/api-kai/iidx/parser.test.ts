import t from "tap";
import { CloseAllConnections } from "test-utils/close-connections";
import { MockJSONFetch } from "test-utils/mock-fetch";
import ResetDBState from "test-utils/resets";
import CreateLogCtx from "lib/logger/logger";
import { ParseKaiIIDX } from "./parser";

const fakeAuth = {
	userID: 1,
	refreshToken: "foo",
	service: "FLO" as const,
	token: "bar",
};

const logger = CreateLogCtx(__filename);

t.test("#ParseKaiIIDX", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should iterate over the IIDX FLO API asynchronously.", async (t) => {
		const mockFloAPI = MockJSONFetch({
			"https://flo.example.com/api/iidx/v2/play_history": {
				_links: {
					_next: "https://flo.example.com/api/iidx/v2/play_history?page=2",
				},
				_items: [1, 2, 3, 4],
			},
			"https://flo.example.com/api/iidx/v2/play_history?page=2": {
				_links: {
					_next: null,
				},
				_items: [5, 6],
			},
		});

		const res = await ParseKaiIIDX("FLO", fakeAuth, logger, mockFloAPI);

		t.equal(res.game, "iidx");
		t.strictSame(res.context, { service: "FLO" });

		const iter = [];

		for await (const el of res.iterable) {
			iter.push(el);
		}

		t.strictSame(iter, [1, 2, 3, 4, 5, 6]);

		t.end();
	});

	t.test("Should iterate over the IIDX EAG API asynchronously.", async (t) => {
		const mockEagAPI = MockJSONFetch({
			"https://eag.example.com/api/iidx/v2/play_history": {
				_links: {
					_next: "https://eag.example.com/api/iidx/v2/play_history?page=2",
				},
				_items: [1, 2, 3, 4],
			},
			"https://eag.example.com/api/iidx/v2/play_history?page=2": {
				_links: {
					_next: null,
				},
				_items: [5, 6],
			},
		});

		const res = await ParseKaiIIDX("EAG", fakeAuth, logger, mockEagAPI);

		t.equal(res.game, "iidx");
		t.strictSame(res.context, { service: "EAG" });

		const iter = [];

		for await (const el of res.iterable) {
			iter.push(el);
		}

		t.strictSame(iter, [1, 2, 3, 4, 5, 6]);

		t.end();
	});

	t.end();
});
