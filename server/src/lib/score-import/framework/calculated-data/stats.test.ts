import CreateLogCtx from "lib/logger/logger";
import { ChartDocument, Difficulties, Lamps, ScoreDocument } from "tachi-common";
import t from "tap";
import { Testing511SPA, TestingIIDXSPDryScore } from "test-utils/test-data";
import { DryScore } from "../common/types";
import { CalculateKTLampRatingIIDX, CalculateMFCP } from "./stats";

t.test("#CalculateKTLampRatingIIDX", (t) => {
	function c(
		nc: number | null,
		hc: number | null,
		exhc: number | null
	): ChartDocument<"iidx:SP"> {
		return Object.assign({}, Testing511SPA, {
			tierlistInfo: {
				"kt-EXHC": {
					value: exhc,
				},
				"kt-HC": {
					value: hc,
				},
				"kt-NC": {
					value: nc,
				},
			},
		});
	}

	function s(lamp: Lamps["iidx:SP" | "iidx:DP"]): DryScore<"iidx:SP" | "iidx:DP"> {
		return Object.assign({}, TestingIIDXSPDryScore, {
			scoreData: {
				lamp,
			},
		});
	}

	t.equal(
		CalculateKTLampRatingIIDX(s("CLEAR"), c(10.5, 10.6, 10.7)),
		10.5,
		"Should return NC if the score was NC."
	);

	t.equal(
		CalculateKTLampRatingIIDX(s("HARD CLEAR"), c(10.5, 10.6, 10.7)),
		10.6,
		"Should return HC if the score was HC."
	);

	t.equal(
		CalculateKTLampRatingIIDX(s("EX HARD CLEAR"), c(10.5, 10.6, 10.7)),
		10.7,
		"Should return EXHC if the score was EXHC."
	);

	t.equal(
		CalculateKTLampRatingIIDX(s("CLEAR"), c(null, 10.6, 10.7)),
		0,
		"Should return 0 if the score was NC but no NC was available."
	);

	t.equal(
		CalculateKTLampRatingIIDX(s("HARD CLEAR"), c(null, null, 10.7)),
		0,
		"Should return 0 if the score was HC but no HC or NC was available."
	);

	t.equal(
		CalculateKTLampRatingIIDX(s("HARD CLEAR"), c(10.5, null, 10.7)),
		10.5,
		"Should return NC if the score was HC but no HC was available."
	);

	t.equal(
		CalculateKTLampRatingIIDX(s("HARD CLEAR"), c(10.9, 10.5, 10.7)),
		10.9,
		"Should return NC if the score was HC but NC was worth more."
	);

	t.equal(
		CalculateKTLampRatingIIDX(s("EX HARD CLEAR"), c(10.9, 10.5, 10.7)),
		10.9,
		"Should return NC if the score was EXHC but NC was worth more."
	);

	t.equal(
		CalculateKTLampRatingIIDX(s("EX HARD CLEAR"), c(10.4, 10.9, 10.7)),
		10.9,
		"Should return HC if the score was EXHC but HC was worth more."
	);

	t.equal(
		CalculateKTLampRatingIIDX(s("CLEAR"), c(null, null, null)),
		10,
		"Should return chart level if the chart has no tierlist data."
	);

	t.end();
});

const logger = CreateLogCtx(__filename);

t.test("#CalculateMFCP", (t) => {
	function TestMFCP(
		lamp: Lamps["ddr:SP" | "ddr:DP"],
		levelNum: number,
		difficulty: Difficulties["ddr:DP" | "ddr:SP"]
	) {
		return CalculateMFCP(
			{
				scoreData: {
					lamp,
				},
			} as ScoreDocument,
			{
				difficulty,
				levelNum,
			} as ChartDocument,
			logger
		);
	}

	t.equal(TestMFCP("FAILED", 10, "EXPERT"), null, "Should return null for non-mfcs");

	t.equal(
		TestMFCP("MARVELOUS FULL COMBO", 10, "BASIC"),
		null,
		"Should reject charts on BASIC difficulty."
	);

	t.equal(
		TestMFCP("MARVELOUS FULL COMBO", 10, "BEGINNER"),
		null,
		"Should reject charts on BEGINNER difficulty."
	);

	t.test("Should return null for charts with level less than 8", (t) => {
		for (let i = 1; i <= 7; i++) {
			t.equal(
				TestMFCP("MARVELOUS FULL COMBO", i, "EXPERT"),
				null,
				`Should return null for charts with level ${i}`
			);
		}

		t.end();
	});

	t.equal(
		TestMFCP("MARVELOUS FULL COMBO", 8, "EXPERT"),
		1,
		"Should return 1 for charts with level 8"
	);
	t.equal(
		TestMFCP("MARVELOUS FULL COMBO", 9, "EXPERT"),
		1,
		"Should return 1 for charts with level 9"
	);
	t.equal(
		TestMFCP("MARVELOUS FULL COMBO", 10, "EXPERT"),
		1,
		"Should return 1 for charts with level 10"
	);

	t.equal(
		TestMFCP("MARVELOUS FULL COMBO", 11, "EXPERT"),
		2,
		"Should return 2 for charts with level 11"
	);
	t.equal(
		TestMFCP("MARVELOUS FULL COMBO", 12, "EXPERT"),
		2,
		"Should return 2 for charts with level 12"
	);

	t.equal(
		TestMFCP("MARVELOUS FULL COMBO", 13, "EXPERT"),
		4,
		"Should return 4 for charts with level 13"
	);

	t.equal(
		TestMFCP("MARVELOUS FULL COMBO", 14, "EXPERT"),
		8,
		"Should return 8 for charts with level 14"
	);

	t.equal(
		TestMFCP("MARVELOUS FULL COMBO", 15, "EXPERT"),
		15,
		"Should return 15 for charts with level 15"
	);

	t.test("Should return 25 for charts with level 16-20", (t) => {
		for (let i = 16; i <= 20; i++) {
			t.equal(
				TestMFCP("MARVELOUS FULL COMBO", i, "EXPERT"),
				25,
				`Should return 25 for charts with level ${i}`
			);
		}
		t.end();
	});

	t.equal(
		TestMFCP("MARVELOUS FULL COMBO", NaN, "EXPERT"),
		null,
		"Invalid level triggers failsafe."
	);

	t.end();
});

t.skip("#CalculateKTRating", (t) => {
	// t.test("Should call the success calculator if percent > pivotPercent", async (t) => {
	// 	const r = await CalculateKTRating(
	// 		deepmerge(TestingIIDXSPDryScore, { scoreData: { percent: 80 } }),
	// 		"iidx",
	// 		"SP",
	// 		Testing511SPA,
	// 		logger
	// 	);

	// 	t.ok(r > 10, "Should return rating greater than the levelNum of the chart.");

	// 	t.end();
	// });

	// t.test("Should call the fail calculator if percent > pivotPercent", async (t) => {
	// 	const r = await CalculateKTRating(
	// 		TestingIIDXSPDryScore,
	// 		"iidx",
	// 		"SP",
	// 		Testing511SPA,
	// 		logger
	// 	);

	// 	t.ok(r < 10, "Should return rating less than the levelNum of the chart.");

	// 	t.end();
	// });

	// t.test("Should call levelNum if percent === pivotPercent", async (t) => {
	// 	const r = await CalculateKTRating(
	// 		deepmerge(TestingIIDXSPDryScore, { scoreData: { percent: 77.7777 } }),
	// 		"iidx",
	// 		"SP",
	// 		Testing511SPA,
	// 		logger
	// 	);

	// 	t.equal(
	// 		// hack for approximate tests
	// 		parseFloat(r.toFixed(2)),
	// 		10,
	// 		"Should return rating exactly that of the levelNum of the chart."
	// 	);

	// 	t.end();
	// });

	// t.test(
	// 	"Should trigger safety if completely invalid percent somehow gets through",
	// 	async (t) => {
	// 		let r = await CalculateKTRating(
	// 			deepmerge(TestingIIDXSPDryScore, { scoreData: { percent: 1000000000 } }),
	// 			"iidx",
	// 			"SP",
	// 			Testing511SPA,
	// 			logger
	// 		);

	// 		t.equal(r, 0, "Should safely return 0 and log a warning.");

	// 		r = await CalculateKTRating(
	// 			// not high enough to be non-finite but high enough to be > 1000
	// 			deepmerge(TestingIIDXSPDryScore, { scoreData: { percent: 200 } }),
	// 			"iidx",
	// 			"SP",
	// 			Testing511SPA,
	// 			logger
	// 		);

	// 		t.equal(r, 0, "Should safely return 0 and log a warning.");

	// 		t.end();
	// 	}
	// );

	t.end();
});
