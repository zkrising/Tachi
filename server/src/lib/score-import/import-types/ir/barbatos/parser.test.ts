import { ParseBarbatosSingle } from "./parser";
import CreateLogCtx from "lib/logger/logger";
import t from "tap";
import ResetDBState from "test-utils/resets";
import { MockBarbatosScore } from "test-utils/test-data";

const logger = CreateLogCtx(__filename);

t.test("#ParseBarbatosSingle", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should return the score as a payload", (t) => {
		const res = ParseBarbatosSingle(
			MockBarbatosScore as unknown as Record<string, unknown>,
			logger
		);

		t.hasStrict(res, {
			game: "sdvx",
			context: {},
			iterable: [MockBarbatosScore],
		});

		t.end();
	});

	t.test("Should reject invalid scores", (t) => {
		t.throws(() => ParseBarbatosSingle({}, logger), {
			message: "Invalid Barbatos Request",
		});

		t.end();
	});

	t.end();
});
