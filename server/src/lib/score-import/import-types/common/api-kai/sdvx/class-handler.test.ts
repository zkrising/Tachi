import { CreateKaiSDVXClassHandler } from "./class-handler";
import { KaiTypeToBaseURL } from "../utils";
import { SDVXDans } from "lib/constants/classes";
import CreateLogCtx from "lib/logger/logger";
import t from "tap";
import { MockBasicFetch, MockJSONFetch } from "test-utils/mock-fetch";
import ResetDBState from "test-utils/resets";

const logger = CreateLogCtx(__filename);

t.test("#CreateKaiSDVXClassHandler", async (t) => {
	t.beforeEach(ResetDBState);

	const fn = await CreateKaiSDVXClassHandler(
		"FLO",
		"token",
		// eslint-disable-next-line @typescript-eslint/require-await
		async () => {
			throw new Error(`Unexpectedly called reauthFn?`);
		},
		MockJSONFetch({
			[`${KaiTypeToBaseURL("FLO")}/api/sdvx/v1/player_profile`]: {
				_links: {},
				sdvx_id: 12345678,
				name: "SOMEONE",
				skill_level: 10,
				access_time: "2019-08-26T18:22:36Z",
				register_time: "2019-08-26T18:22:36Z",
			},
		})
	);

	t.test("Should return a function with arity 5.", (t) => {
		t.equal(fn.length, 5);

		t.end();
	});

	t.test("Should call the provided URL with the authentication token", (t) => {
		const res = fn("sdvx", "Single", 1, {}, logger);

		t.strictSame(res, { dan: 9 });

		t.end();
	});

	t.test("Should return nothing if dan is not a number", async (t) => {
		const fn = await CreateKaiSDVXClassHandler(
			"FLO",
			"token",
			// eslint-disable-next-line @typescript-eslint/require-await
			async () => {
				throw new Error(`Unexpectedly called reauthFn?`);
			},
			MockJSONFetch({
				[`${KaiTypeToBaseURL("FLO")}/api/sdvx/v1/player_profile`]: {
					_links: {},
					sdvx_id: 12345678,
					name: "SOMEONE",
					skill_level: "NOT A NUMBER",
					access_time: "2019-08-26T18:22:36Z",
					register_time: "2019-08-26T18:22:36Z",
				},
			})
		);

		const res = fn("sdvx", "Single", 1, {}, logger);

		t.strictSame(res, {});

		t.end();
	});

	t.test("Should return nothing if dan is too great", async (t) => {
		const fn = await CreateKaiSDVXClassHandler(
			"FLO",
			"token",
			// eslint-disable-next-line @typescript-eslint/require-await
			async () => {
				throw new Error(`Unexpectedly called reauthFn?`);
			},
			MockJSONFetch({
				[`${KaiTypeToBaseURL("FLO")}/api/sdvx/v1/player_profile`]: {
					_links: {},
					sdvx_id: 12345678,
					name: "SOMEONE",
					skill_level: SDVXDans.INF + 2,
					access_time: "2019-08-26T18:22:36Z",
					register_time: "2019-08-26T18:22:36Z",
				},
			})
		);

		const res = fn("sdvx", "Single", 1, {}, logger);

		t.strictSame(res, {});

		t.end();
	});

	t.test("Should return nothing if dan is negative", async (t) => {
		const fn = await CreateKaiSDVXClassHandler(
			"FLO",
			"token",
			// eslint-disable-next-line @typescript-eslint/require-await
			async () => {
				throw new Error(`Unexpectedly called reauthFn?`);
			},
			MockJSONFetch({
				[`${KaiTypeToBaseURL("FLO")}/api/sdvx/v1/player_profile`]: {
					_links: {},
					sdvx_id: 12345678,
					name: "SOMEONE",
					skill_level: -1,
					access_time: "2019-08-26T18:22:36Z",
					register_time: "2019-08-26T18:22:36Z",
				},
			})
		);

		const res = fn("sdvx", "Single", 1, {}, logger);

		t.strictSame(res, {});

		t.end();
	});

	t.test("Should gracefully handle negative API responses", async (t) => {
		const fn = await CreateKaiSDVXClassHandler(
			"FLO",
			"token",
			// eslint-disable-next-line @typescript-eslint/require-await
			async () => {
				throw new Error(`Unexpectedly called reauthFn?`);
			},
			MockBasicFetch({ status: 500 })
		);

		const res = fn("sdvx", "Single", 1, {}, logger);

		t.strictSame(res, {});

		t.end();
	});

	t.test("Should call reauthFn if statusCode is 401", async (t) => {
		let pass = false;
		const fn = await CreateKaiSDVXClassHandler(
			"FLO",
			"token",
			// eslint-disable-next-line @typescript-eslint/require-await
			async () => {
				pass = true;
				return "";
			},
			MockBasicFetch({ status: 401 })
		);

		fn("sdvx", "Single", 1, {}, logger);

		t.equal(pass, true, "Should've called the reauth fn.");

		t.end();
	});

	t.test("Should ignore null dans", async (t) => {
		const fn = await CreateKaiSDVXClassHandler(
			"FLO",
			"token",
			// eslint-disable-next-line @typescript-eslint/require-await
			async () => {
				throw new Error(`Unexpectedly called reauthFn?`);
			},
			MockJSONFetch({
				[`${KaiTypeToBaseURL("FLO")}/api/sdvx/v1/player_profile`]: {
					_links: {},
					sdvx_id: 12345678,
					name: "SOMEONE",
					skill_level: null,
					access_time: "2019-08-26T18:22:36Z",
					register_time: "2019-08-26T18:22:36Z",
				},
			})
		);

		const res = fn("sdvx", "Single", 1, {}, logger);

		t.strictSame(res, {});

		t.end();
	});

	t.end();
});
