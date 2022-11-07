import { CalculateRatings } from "./rating";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import t from "tap";
import { mkFakePBIIDXSP, mkFakePBJubeat } from "test-utils/misc";
import ResetDBState from "test-utils/resets";

const logger = CreateLogCtx(__filename);

t.test("#CalculateRatings", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should return BPI for IIDX", async (t) => {
		const res = await CalculateRatings("iidx", "SP", 1, logger);

		t.strictSame(res, { BPI: null, ktLampRating: null }, "Should return BPI as a custom key.");

		const resDP = await CalculateRatings("iidx", "DP", 1, logger);

		t.strictSame(
			resDP,
			{ BPI: null, ktLampRating: null },
			"Should return BPI as a custom key."
		);

		t.end();
	});

	t.test("Should return VF6 for SDVX", async (t) => {
		const res = await CalculateRatings("sdvx", "Single", 1, logger);

		t.strictSame(res, { VF6: null }, "Should return VF6 keys.");

		t.end();
	});

	t.test("Should return VF6 for USC:Keyboard", async (t) => {
		const res = await CalculateRatings("usc", "Keyboard", 1, logger);

		t.strictSame(res, { VF6: null }, "Should return VF6 keys.");

		t.end();
	});

	t.test("Should return VF6 for USC:Controller", async (t) => {
		const res = await CalculateRatings("usc", "Controller", 1, logger);

		t.strictSame(res, { VF6: null }, "Should return VF6 keys.");

		t.end();
	});

	t.test("Should return MFCP for DDR", async (t) => {
		const res = await CalculateRatings("ddr", "SP", 1, logger);

		t.strictSame(res, { MFCP: null, ktRating: null }, "Should return MFCP keys.");

		const resDP = await CalculateRatings("ddr", "DP", 1, logger);

		t.strictSame(resDP, { MFCP: null, ktRating: null }, "Should return MFCP keys.");

		t.end();
	});

	t.test("Should return skill for Gitadora", async (t) => {
		const res = await CalculateRatings("gitadora", "Dora", 1, logger);

		t.strictSame(res, { skill: null, naiveSkill: null }, "Should return skill keys.");

		const res2 = await CalculateRatings("gitadora", "Gita", 1, logger);

		t.strictSame(res2, { skill: null, naiveSkill: null }, "Should return skill keys.");

		t.end();
	});

	t.test("Should calculate jubility for Jubeat", async (t) => {
		await db["personal-bests"].insert(mkFakePBJubeat());

		const res = await CalculateRatings("jubeat", "Single", 1, logger);

		t.strictSame(res, { jubility: 5, naiveJubility: 5 }, "Should return jubility keys.");

		t.end();
	});

	t.end();
});
