/* eslint-disable @typescript-eslint/no-explicit-any */
import { ParseKsHookSV6CStatic } from "./parser";
import deepmerge from "deepmerge";
import CreateLogCtx from "lib/logger/logger";
import t from "tap";
import { TestingKsHookSV6CScore, TestingKsHookSV6CStaticScore } from "test-utils/test-data";

const logger = CreateLogCtx(__filename);

t.test("#ParseKsHookSV6CStatic", (t) => {
	const assertFail = (data: any, message: string) => {
		t.throws(() => ParseKsHookSV6CStatic(data, logger), message);
	};

	const assertSuccess = (data: any, message: string) => {
		try {
			t.doesNotThrow(() => ParseKsHookSV6CStatic(data, logger), message);

			const res = ParseKsHookSV6CStatic(data, logger);

			t.equal(res.game, "sdvx");
			t.ok(Array.isArray(res.iterable));
		} catch (err) {
			t.fail(`[${message}] ${(err as Error).message}`);
		}
	};

	const dm = (data: any) => ({ scores: [deepmerge(TestingKsHookSV6CStaticScore, data)] });

	assertSuccess({ scores: [TestingKsHookSV6CStaticScore] }, "Should parse a valid score.");
	assertSuccess(
		dm({ unexpectedField: "foo" }),
		"Should allow excess keys that we do not recognise."
	);

	assertFail({}, "Should reject an empty object");
	assertFail({ scores: TestingKsHookSV6CStaticScore }, "Should reject non-array scores");
	assertFail(dm({ clear: "invalid_clear" }), "Should reject invalid clears.");
	assertFail(dm({ difficulty: "invalid_difficulty" }), "Should reject invalid difficulties.");

	assertFail(dm({ grade: "invalid_grade" }), "Should reject invalid grades.");

	assertFail(dm({ max_chain: -1 }), "Should reject negative max_chains.");
	assertFail(dm({ max_chain: 100.5 }), "Should reject non-integer max_chains.");

	assertFail(dm({ score: -1 }), "Should reject negative scores.");
	assertFail(dm({ score: 10_000_001 }), "Should reject > 10m scores.");
	assertSuccess(dm({ score: 10_000_000 }), "Should allow scores of 10m.");
	assertSuccess(dm({ score: 0 }), "Should allow scores of 0.");

	assertSuccess(
		{ scores: [TestingKsHookSV6CStaticScore, TestingKsHookSV6CStaticScore] },
		"Should allow multiple scores in the scores array."
	);

	t.end();
});
