/* eslint-disable @typescript-eslint/no-explicit-any */
import deepmerge from "deepmerge";
import CreateLogCtx from "lib/logger/logger";
import t from "tap";
import { TestingKsHookSV6CScore } from "test-utils/test-data";
import { ParseKsHookSV6C } from "./parser";

const logger = CreateLogCtx(__filename);

t.test("#ParseKsHookSV6C", (t) => {
	const assertFail = (data: any, message: string) => {
		t.throws(() => ParseKsHookSV6C(data, logger), message);
	};

	const assertSuccess = (data: any, message: string) => {
		try {
			t.doesNotThrow(() => ParseKsHookSV6C(data, logger), message);

			const res = ParseKsHookSV6C(data, logger);

			t.equal(res.game, "sdvx");
			t.type(res.context.timeReceived, "number");
			t.ok(Array.isArray(res.iterable));
		} catch (err) {
			t.fail(`[${message}] ${(err as Error).message}`);
		}
	};

	const dm = (data: any) => deepmerge(TestingKsHookSV6CScore, data);

	assertSuccess(TestingKsHookSV6CScore, "Should parse a valid score.");
	assertSuccess(
		dm({ unexpectedField: "foo" }),
		"Should allow excess keys that we do not recognise."
	);

	assertFail({}, "Should reject an empty object");
	assertFail(dm({ clear: "invalid_clear" }), "Should reject invalid clears.");
	assertFail(dm({ difficulty: "invalid_difficulty" }), "Should reject invalid difficulties.");

	assertFail(dm({ gauge: -1 }), "Should reject negative gauge values.");
	assertFail(dm({ gauge: 10001 }), "Should reject gauge values over 10000.");
	assertSuccess(dm({ gauge: 0 }), "Should allow gauge values of 0.");
	assertSuccess(dm({ gauge: 10000 }), "Should allow gauge values of 10000.");

	assertFail(dm({ grade: "invalid_grade" }), "Should reject invalid grades.");

	assertFail(dm({ max_chain: -1 }), "Should reject negative max_chains.");
	assertFail(dm({ max_chain: 100.5 }), "Should reject non-integer max_chains.");

	assertFail(dm({ score: -1 }), "Should reject negative scores.");
	assertFail(dm({ score: 10_000_001 }), "Should reject > 10m scores.");
	assertSuccess(dm({ score: 10_000_000 }), "Should allow scores of 10m.");
	assertSuccess(dm({ score: 0 }), "Should allow scores of 0.");

	assertFail(dm({ rate: "invalid_rate" }), "Should reject invalid rates.");

	assertFail(dm({ track_no: -1 }), "Should reject negative track_no's.");
	assertFail(dm({ track_no: 50.5 }), "Should reject non-int track_no's.");

	t.end();
});
