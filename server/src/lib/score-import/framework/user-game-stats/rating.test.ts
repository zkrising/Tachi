import t from "tap";
import ResetDBState from "test-utils/resets";
import { CalculateRatings } from "./rating";
import CreateLogCtx from "lib/logger/logger";

const logger = CreateLogCtx(__filename);

t.test("#CalculateRatings", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should return BPI for IIDX", async (t) => {
		const res = await CalculateRatings("iidx", "SP", 1, logger);

		t.strictSame(
			res,
			{ BPI: 0, ktRating: 0, ktLampRating: 0 },
			"Should return BPI as a custom key."
		);

		const resDP = await CalculateRatings("iidx", "DP", 1, logger);

		t.strictSame(
			resDP,
			{ BPI: 0, ktRating: 0, ktLampRating: 0 },
			"Should return BPI as a custom key."
		);

		t.end();
	});

	t.test("Should return VF4 and VF5 for SDVX", async (t) => {
		const res = await CalculateRatings("sdvx", "Single", 1, logger);

		t.strictSame(res, { VF6: 0 }, "Should return VF4 and VF5 keys.");

		t.end();
	});

	t.test("Should return VF4 and VF5 for USC", async (t) => {
		const res = await CalculateRatings("usc", "Single", 1, logger);

		t.strictSame(res, { VF6: 0 }, "Should return VF4 and VF5 keys.");

		t.end();
	});

	t.test("Should return MFCP for DDR", async (t) => {
		const res = await CalculateRatings("ddr", "SP", 1, logger);

		t.strictSame(res, { MFCP: 0, ktRating: 0 }, "Should return MFCP keys.");

		const resDP = await CalculateRatings("ddr", "DP", 1, logger);

		t.strictSame(resDP, { MFCP: 0, ktRating: 0 }, "Should return MFCP keys.");

		t.end();
	});

	t.test("Should return skill for Gitadora", async (t) => {
		const res = await CalculateRatings("gitadora", "Dora", 1, logger);

		t.strictSame(res, { skill: 0 }, "Should return skill keys.");

		const resDP = await CalculateRatings("gitadora", "Gita", 1, logger);

		t.strictSame(resDP, { skill: 0 }, "Should return skill keys.");

		t.end();
	});

	t.end();
});
