import t from "tap";
import db from "../../../../../external/mongo/db";
import CreateLogCtx from "../../../../logger/logger";
import ResetDBState from "../../../../../test-utils/resets";
import { GetKTDataJSON, Testing511Song, Testing511SPA } from "../../../../../test-utils/test-data";
import { InternalFailure } from "../../../framework/common/converter-failures";
import {
	ConverterIRFervidex,
	SplitFervidexChartRef,
	TachifyAssist,
	TachifyGauge,
	TachifyRandom,
	TachifyRange,
} from "./converter";
import { FervidexScore } from "./types";
import deepmerge from "deepmerge";
import { CloseAllConnections } from "../../../../../test-utils/close-connections";

const logger = CreateLogCtx(__filename);

t.test("#SplitFervidexChartRef", (t) => {
	t.strictSame(SplitFervidexChartRef("spb"), { playtype: "SP", difficulty: "BEGINNER" });
	t.strictSame(SplitFervidexChartRef("spn"), { playtype: "SP", difficulty: "NORMAL" });
	t.strictSame(SplitFervidexChartRef("sph"), { playtype: "SP", difficulty: "HYPER" });
	t.strictSame(SplitFervidexChartRef("spa"), { playtype: "SP", difficulty: "ANOTHER" });
	t.strictSame(SplitFervidexChartRef("spl"), { playtype: "SP", difficulty: "LEGGENDARIA" });
	t.strictSame(SplitFervidexChartRef("dpn"), { playtype: "DP", difficulty: "NORMAL" });
	t.strictSame(SplitFervidexChartRef("dph"), { playtype: "DP", difficulty: "HYPER" });
	t.strictSame(SplitFervidexChartRef("dpa"), { playtype: "DP", difficulty: "ANOTHER" });
	t.strictSame(SplitFervidexChartRef("dpl"), { playtype: "DP", difficulty: "LEGGENDARIA" });

	t.throws(
		() => SplitFervidexChartRef("INVALID" as "spn"),
		new InternalFailure(`Invalid fervidex difficulty of INVALID`) as any
	);

	t.end();
});

t.test("#TachifyAssist", (t) => {
	t.equal(TachifyAssist("ASCR_LEGACY"), "FULL ASSIST");
	t.equal(TachifyAssist("AUTO_SCRATCH"), "AUTO SCRATCH");
	t.equal(TachifyAssist("FULL_ASSIST"), "FULL ASSIST");
	t.equal(TachifyAssist("LEGACY_NOTE"), "LEGACY NOTE");
	t.equal(TachifyAssist(null), "NO ASSIST");
	t.equal(TachifyAssist(undefined), "NO ASSIST");

	t.end();
});

t.test("#TachifyGauge", (t) => {
	t.equal(TachifyGauge("ASSISTED_EASY"), "ASSISTED EASY");
	t.equal(TachifyGauge("EASY"), "EASY");
	t.equal(TachifyGauge("HARD"), "HARD");
	t.equal(TachifyGauge("EX_HARD"), "EX HARD");
	t.equal(TachifyGauge(null), "NORMAL");
	t.equal(TachifyGauge(undefined), "NORMAL");

	t.end();
});

t.test("#TachifyRange", (t) => {
	t.equal(TachifyRange("HIDDEN_PLUS"), "HIDDEN+");
	t.equal(TachifyRange("LIFT"), "LIFT");
	t.equal(TachifyRange("LIFT_SUD_PLUS"), "LIFT SUD+");
	t.equal(TachifyRange("SUDDEN_PLUS"), "SUDDEN+");
	t.equal(TachifyRange("SUD_PLUS_HID_PLUS"), "SUD+ HID+");
	t.equal(TachifyRange(null), "NONE");
	t.equal(TachifyRange(undefined), "NONE");

	t.end();
});

t.test("#TachifyRandom", (t) => {
	t.equal(TachifyRandom("MIRROR"), "MIRROR");
	t.equal(TachifyRandom("R_RANDOM"), "R-RANDOM");
	t.equal(TachifyRandom("S_RANDOM"), "S-RANDOM");
	t.equal(TachifyRandom("RANDOM"), "RANDOM");
	t.equal(TachifyRandom(null), "NONRAN");
	t.equal(TachifyRandom(undefined), "NONRAN");

	t.end();
});

const baseFervidexScore: FervidexScore = GetKTDataJSON("./fervidex/base.json");

const baseDryScore = {
	game: "iidx",
	service: "Fervidex",
	comment: null,
	importType: "ir/fervidex",
	scoreData: {
		score: 68,
		percent: 4.325699745547074,
		grade: "F",
		lamp: "FAILED",
		judgements: {
			pgreat: 34,
			great: 0,
			good: 0,
			bad: 0,
			poor: 6,
		},
		hitMeta: {
			fast: 0,
			slow: 0,
			maxCombo: 34,
			gaugeHistory: [100, 50],
			gauge: 50,
			bp: 6,
			comboBreak: 6,
			gsm: undefined,
		},
	},
	scoreMeta: {
		assist: "NO ASSIST",
		gauge: "HARD",
		random: "RANDOM",
		range: "SUDDEN+",
	},
};

t.test("#ConverterIRFervidex", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should convert a valid fervidex score into a dry score.", async (t) => {
		const res = await ConverterIRFervidex(
			baseFervidexScore,
			{ version: "27" },
			"ir/fervidex",
			logger
		);

		t.hasStrict(
			res,
			{
				song: Testing511Song,
				chart: Testing511SPA,
				dryScore: baseDryScore,
			}, // broken
			"Should return a dry score."
		);

		t.end();
	});

	t.test("Should reject scores on unknown charts", (t) => {
		t.rejects(
			ConverterIRFervidex(
				deepmerge(baseFervidexScore, { chart: "spl" }),
				{ version: "27" },
				"ir/fervidex",
				logger
			),
			{ message: /could not find chart/giu } as any
		);

		t.end();
	});

	t.test("Should throw internal failure on chart-song desync", async (t) => {
		await db.songs.iidx.remove({}); // this forces desync

		t.rejects(
			ConverterIRFervidex(baseFervidexScore, { version: "27" }, "ir/fervidex", logger),
			{ message: /Song 1 \(iidx\) has no parent song/giu } as any
		);

		t.end();
	});

	t.test("Should throw invalid score on percent > 100.", (t) => {
		t.rejects(
			ConverterIRFervidex(
				// @ts-expect-error eternally broken deepmerge
				deepmerge(baseFervidexScore, { ex_score: 9999 }),
				{ version: "27" },
				"ir/fervidex",
				logger
			),
			{ message: /Invalid percent/giu } as any
		);

		t.end();
	});

	t.test("Should throw invalid score on gauge > 100.", (t) => {
		t.rejects(
			ConverterIRFervidex(
				// @ts-expect-error eternally broken deepmerge
				deepmerge(baseFervidexScore, { gauge: [150] }),
				{ version: "27" },
				"ir/fervidex",
				logger
			),
			{ message: /Invalid value of gauge 150/giu } as any
		);

		t.end();
	});

	t.test("Should convert undeflow gauge to null.", async (t) => {
		const res = await ConverterIRFervidex(
			deepmerge(baseFervidexScore, { gauge: [10, 5, 249, 248] }),
			{ version: "27" },
			"ir/fervidex",
			logger
		);

		t.hasStrict(
			res,
			{
				song: Testing511Song,
				chart: Testing511SPA,
				dryScore: deepmerge(baseDryScore, {
					scoreData: { hitMeta: { gauge: null, gaugeHistory: [10, 5, null, null] } },
				}),
			} as any, // broken
			"Should return a dry score."
		);

		t.end();
	});

	t.end();
});

t.teardown(CloseAllConnections);
