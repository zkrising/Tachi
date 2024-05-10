import { ProcessClassDeltas, CalculateUGPTClasses } from "./classes";
import CreateLogCtx from "lib/logger/logger";
import { GITADORA_COLOURS } from "tachi-common";
import t from "tap";
import ResetDBState from "test-utils/resets";
import type { UserGameStats } from "tachi-common";

const logger = CreateLogCtx(__filename);

t.test("#CalculateUGPTClasses", (t) => {
	t.test("Should produce an empty object by default", async (t) => {
		const res = await CalculateUGPTClasses("iidx", "SP", 1, {}, null, logger);

		t.strictSame(res, {});

		t.end();
	});

	t.test("Should call and merge the ClassHandler", async (t) => {
		const res = await CalculateUGPTClasses(
			"iidx",
			"SP",
			1,
			{},
			() => ({ dan: "DAN_2" }),
			logger
		);

		t.strictSame(res, { dan: "DAN_2" });

		t.end();
	});

	t.test("Should call static handlers if there is one", async (t) => {
		const res = await CalculateUGPTClasses(
			"gitadora",
			"Dora",
			1,
			{
				naiveSkill: 9000,
			},
			null,
			logger
		);

		t.strictSame(res, { colour: "RAINBOW" });

		t.end();
	});

	t.end();
});

t.test("#ProcessClassDeltas", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should return improved classes from null", async (t) => {
		const res = await ProcessClassDeltas("iidx", "SP", { dan: "KAIDEN" }, null, 1, logger);

		t.strictSame(res, [
			{
				game: "iidx",
				set: "dan",
				playtype: "SP",
				old: null,
				new: "KAIDEN",
			},
		]);

		t.end();
	});

	t.test("Should return improved classes from null class", async (t) => {
		const res = await ProcessClassDeltas(
			"iidx",
			"SP",
			{ dan: "KAIDEN" },
			{ classes: {} } as UserGameStats,
			1,
			logger
		);

		t.strictSame(res, [
			{
				game: "iidx",
				set: "dan",
				playtype: "SP",
				old: null,
				new: "KAIDEN",
			},
		]);

		t.end();
	});

	t.test("Should return improved classes", async (t) => {
		const res = await ProcessClassDeltas(
			"iidx",
			"SP",
			{ dan: "KAIDEN" },
			{ classes: { dan: "CHUUDEN" } } as unknown as UserGameStats,
			1,
			logger
		);

		t.strictSame(res, [
			{
				game: "iidx",
				set: "dan",
				playtype: "SP",
				old: "CHUUDEN",
				new: "KAIDEN",
			},
		]);

		t.end();
	});

	t.test("Should not return identical classes", async (t) => {
		const res = await ProcessClassDeltas(
			"iidx",
			"SP",
			{ dan: "KAIDEN" },
			{ classes: { dan: "KAIDEN" } } as unknown as UserGameStats,
			1,
			logger
		);

		t.strictSame(res, []);

		t.end();
	});

	t.test("Should not return worse classes if the class isn't downgradable", async (t) => {
		const res = await ProcessClassDeltas(
			"iidx",
			"SP",
			{ dan: "DAN_10" },
			{ classes: { dan: "KAIDEN" } } as unknown as UserGameStats,
			1,
			logger
		);

		t.strictSame(res, []);

		t.end();
	});

	t.test("Should return worse classes if the class is downgradable", async (t) => {
		const res = await ProcessClassDeltas(
			"sdvx",
			"Single",
			{ vfClass: "DANDELION_I" },
			{ classes: { vfClass: "DANDELION_II" } } as unknown as UserGameStats,
			1,
			logger
		);

		t.strictSame(res, [
			{
				game: "sdvx",
				set: "vfClass",
				playtype: "Single",
				old: "DANDELION_II",
				new: "DANDELION_I",
			},
		]);

		t.end();
	});

	t.end();
});
