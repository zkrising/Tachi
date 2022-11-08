import { CreateKaiIIDXClassHandler } from "./class-handler";
import { KaiTypeToBaseURL } from "../utils";
import { IIDXDans } from "lib/constants/classes";
import CreateLogCtx from "lib/logger/logger";
import t from "tap";
import { MockBasicFetch, MockJSONFetch } from "test-utils/mock-fetch";
import ResetDBState from "test-utils/resets";

const logger = CreateLogCtx(__filename);

t.test("#CreateKaiIIDXClassHandler", async (t) => {
	t.beforeEach(ResetDBState);

	const fn = await CreateKaiIIDXClassHandler(
		"FLO",
		"token",
		// eslint-disable-next-line @typescript-eslint/require-await
		async () => {
			throw new Error(`Unexpectedly called reauthFn?`);
		},
		MockJSONFetch({
			[`${KaiTypeToBaseURL("FLO")}/api/iidx/v2/player_profile`]: {
				_links: {},
				iidx_id: 12345678,
				dj_name: "SOMEONE",
				sp: 18,
				dp: 4,
				access_time: "2021-08-08T18:50:40Z",
				register_time: "2019-01-19T12:53:50Z",
			},
		})
	);

	t.test("Should return a function with arity 5.", (t) => {
		t.equal(fn.length, 5);

		t.end();
	});

	t.test("Should call the provided URL with the authentication token", (t) => {
		const res = fn("iidx", "SP", 1, {}, logger);

		t.strictSame(res, { dan: 18 });

		t.end();
	});

	t.test("Should return nothing if dan is not a number", async (t) => {
		const fn = await CreateKaiIIDXClassHandler(
			"FLO",
			"token",
			// eslint-disable-next-line @typescript-eslint/require-await
			async () => {
				throw new Error(`Unexpectedly called reauthFn?`);
			},
			MockJSONFetch({
				[`${KaiTypeToBaseURL("FLO")}/api/iidx/v2/player_profile`]: {
					_links: {},
					iidx_id: 12345678,
					dj_name: "SOMEONE",
					sp: "NOT A NUMBER",
					dp: 4,
					access_time: "2021-08-08T18:50:40Z",
					register_time: "2019-01-19T12:53:50Z",
				},
			})
		);

		const res = fn("iidx", "SP", 1, {}, logger);

		t.strictSame(res, {});

		t.end();
	});

	t.test("Should return nothing if dan is too great", async (t) => {
		const fn = await CreateKaiIIDXClassHandler(
			"FLO",
			"token",
			// eslint-disable-next-line @typescript-eslint/require-await
			async () => {
				throw new Error(`Unexpectedly called reauthFn?`);
			},
			MockJSONFetch({
				[`${KaiTypeToBaseURL("FLO")}/api/iidx/v2/player_profile`]: {
					_links: {},
					iidx_id: 12345678,
					dj_name: "SOMEONE",
					sp: IIDXDans.KAIDEN + 1,
					dp: 4,
					access_time: "2021-08-08T18:50:40Z",
					register_time: "2019-01-19T12:53:50Z",
				},
			})
		);

		const res = fn("iidx", "SP", 1, {}, logger);

		t.strictSame(res, {});

		t.end();
	});

	t.test("Should return nothing if dan is negative", async (t) => {
		const fn = await CreateKaiIIDXClassHandler(
			"FLO",
			"token",
			// eslint-disable-next-line @typescript-eslint/require-await
			async () => {
				throw new Error(`Unexpectedly called reauthFn?`);
			},
			MockJSONFetch({
				[`${KaiTypeToBaseURL("FLO")}/api/iidx/v2/player_profile`]: {
					_links: {},
					iidx_id: 12345678,
					dj_name: "SOMEONE",
					sp: IIDXDans.KYU_7 - 1,
					dp: 4,
					access_time: "2021-08-08T18:50:40Z",
					register_time: "2019-01-19T12:53:50Z",
				},
			})
		);

		const res = fn("iidx", "SP", 1, {}, logger);

		t.strictSame(res, {});

		t.end();
	});

	t.test("Should gracefully handle negative API responses", async (t) => {
		const fn = await CreateKaiIIDXClassHandler(
			"FLO",
			"token",
			// eslint-disable-next-line @typescript-eslint/require-await
			async () => {
				throw new Error(`Unexpectedly called reauthFn?`);
			},
			MockBasicFetch({ status: 500 })
		);

		const res = fn("iidx", "SP", 1, {}, logger);

		t.strictSame(res, {});

		t.end();
	});

	t.test("Should call reauthFn if statusCode is 401", async (t) => {
		let pass = false;
		const fn = await CreateKaiIIDXClassHandler(
			"FLO",
			"token",
			// eslint-disable-next-line @typescript-eslint/require-await
			async () => {
				pass = true;
				return "";
			},
			MockBasicFetch({ status: 401 })
		);

		fn("iidx", "SP", 1, {}, logger);

		t.equal(pass, true, "Should've called the reauth fn.");

		t.end();
	});

	t.test("Should ignore null dans", async (t) => {
		const fn = await CreateKaiIIDXClassHandler(
			"FLO",
			"token",
			// eslint-disable-next-line @typescript-eslint/require-await
			async () => {
				throw new Error(`Unexpectedly called reauthFn?`);
			},
			MockJSONFetch({
				[`${KaiTypeToBaseURL("FLO")}/api/iidx/v2/player_profile`]: {
					_links: {},
					iidx_id: 12345678,
					dj_name: "SOMEONE",
					sp: 1,
					dp: null,
					access_time: "2021-08-08T18:50:40Z",
					register_time: "2019-01-19T12:53:50Z",
				},
			})
		);

		const res = fn("iidx", "DP", 1, {}, logger);

		t.strictSame(res, {});

		t.end();
	});

	t.test("Should handle invalid playtypes", async (t) => {
		const fn = await CreateKaiIIDXClassHandler(
			"FLO",
			"token",
			// eslint-disable-next-line @typescript-eslint/require-await
			async () => {
				throw new Error(`Unexpectedly called reauthFn?`);
			},
			MockJSONFetch({
				[`${KaiTypeToBaseURL("FLO")}/api/iidx/v2/player_profile`]: {
					_links: {},
					iidx_id: 12345678,
					dj_name: "SOMEONE",
					sp: 1,
					dp: 1,
					access_time: "2021-08-08T18:50:40Z",
					register_time: "2019-01-19T12:53:50Z",
				},
			})
		);

		const res = fn("iidx", "14K", 1, {}, logger);

		t.strictSame(res, {});

		t.end();
	});

	t.end();
});
