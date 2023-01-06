import {
	ConverterIRFervidex,
	SplitFervidexChartRef,
	TachifyAssist,
	TachifyGauge,
	TachifyRandom,
	TachifyRange,
} from "./converter";
import { InternalFailure } from "../../../framework/common/converter-failures";
import deepmerge from "deepmerge";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { CreateScoreID } from "lib/score-import/framework/score-importing/score-id";
import t from "tap";
import { mkFakeScoreIIDXSP } from "test-utils/misc";
import ResetDBState from "test-utils/resets";
import { Testing511Song, Testing511SPA, TestingIIDXSPDryScore } from "test-utils/test-data";
import type { FervidexScore } from "./types";

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
		new InternalFailure(`Invalid fervidex difficulty of INVALID`)
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
	t.equal(TachifyGauge("EX_HARD"), "EX-HARD");
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

const baseFervidexScore: FervidexScore = {
	bad: 0,
	chart: "spa",
	clear_type: 1,
	combo_break: 6,
	custom: false,
	chart_sha256: "asdfasdf",
	entry_id: 1000,
	ex_score: 68,
	fast: 0,
	gauge: [100, 50],
	ghost: [0, 2],
	good: 0,
	great: 0,
	max_combo: 34,
	option: {
		gauge: "HARD",
		range: "SUDDEN_PLUS",
		style: "RANDOM",
	},
	pacemaker: {
		name: "",
		score: 363,
		type: "PACEMAKER_A",
	},
	pgreat: 34,
	poor: 6,
	slow: 0,
};

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
		optional: {
			fast: 0,
			slow: 0,
			maxCombo: null,
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
			{ version: "27", timeReceived: 10, userID: 1 },
			"ir/fervidex",
			logger
		);

		t.hasStrict(
			res,
			{
				song: Testing511Song,
				chart: Testing511SPA,
				dryScore: baseDryScore,
			},
			"Should return a dry score."
		);

		t.end();
	});

	t.test("Should turn DP randoms into tuples.", async (t) => {
		// lazily clone the SPA as a DPA.

		const Testing511DPA = deepmerge(Testing511SPA, {
			playtype: "DP",
			chartID: "dp_test",
			data: {},
		});

		await db.charts.iidx.insert(Testing511DPA);

		// @ts-expect-error apparantly this prop isnt optional. but i'm sure it is.
		delete Testing511DPA._id;

		const res = await ConverterIRFervidex(
			deepmerge(baseFervidexScore, { option: { style_2p: "R_RANDOM" }, chart: "dpa" }),
			{ version: "27", timeReceived: 10, userID: 1 },
			"ir/fervidex",
			logger
		);

		t.hasStrict(
			res,
			{
				song: Testing511Song,
				chart: Testing511DPA,
				dryScore: deepmerge(baseDryScore, {
					scoreMeta: { random: ["RANDOM", "R-RANDOM"] },
				}),
			},
			"Should return a dry score."
		);

		t.end();
	});

	t.test("Should null BP if the user died pre-emptively.", async (t) => {
		const res = await ConverterIRFervidex(
			deepmerge(baseFervidexScore, { dead: { measure: 1, note: 10 } }),
			{ version: "27", timeReceived: 10, userID: 1 },
			"ir/fervidex",
			logger
		);

		t.hasStrict(
			res,
			{
				song: Testing511Song,
				chart: Testing511SPA,
				dryScore: deepmerge(baseDryScore, { scoreData: { optional: { bp: null } } }),
			},
			"Should return a dry score."
		);

		t.end();
	});

	t.test("Should reject scores on unknown charts", (t) => {
		t.rejects(
			ConverterIRFervidex(
				deepmerge(baseFervidexScore, { chart: "spl" }),
				{ version: "27", timeReceived: 10, userID: 1 },
				"ir/fervidex",
				logger
			),
			/could not find chart/giu
		);

		t.end();
	});

	t.test("Should throw internal failure on chart-song desync", async (t) => {
		// this forces desync
		await db.songs.iidx.remove({});

		t.rejects(
			ConverterIRFervidex(
				baseFervidexScore,
				{ version: "27", timeReceived: 10, userID: 1 },
				"ir/fervidex",
				logger
			),
			/Song 1 \(iidx\) has no parent song/giu
		);

		t.end();
	});

	t.test("Should throw invalid score on percent > 100.", (t) => {
		t.rejects(
			ConverterIRFervidex(
				// eslint-disable-next-line lines-around-comment
				// @ts-expect-error eternally broken deepmerge
				deepmerge(baseFervidexScore, { ex_score: 9999 }),
				{ version: "27" },
				"ir/fervidex",
				logger
			),
			/Invalid percent/giu
		);

		t.end();
	});

	t.test("Should throw invalid score on gauge > 100.", (t) => {
		t.rejects(
			ConverterIRFervidex(
				// eslint-disable-next-line lines-around-comment
				// @ts-expect-error eternally broken deepmerge
				deepmerge(baseFervidexScore, { gauge: [150] }),
				{ version: "27" },
				"ir/fervidex",
				logger
			),
			/Invalid value of gauge 150./giu
		);

		t.end();
	});

	t.test("Should convert underflow gauge to null.", async (t) => {
		const res = await ConverterIRFervidex(
			deepmerge(baseFervidexScore, { gauge: [10, 5, 249, 248] }) as FervidexScore,
			{ version: "27", timeReceived: 10, userID: 1 },
			"ir/fervidex",
			logger
		);

		t.hasStrict(
			res,
			{
				song: Testing511Song,
				chart: Testing511SPA,
				dryScore: deepmerge(baseDryScore, {
					scoreData: { optional: { gauge: null, gaugeHistory: [10, 5, null, null] } },
				}),
			},
			"Should return a dry score."
		);

		t.end();
	});

	t.test("Should highlight existing scores.", async (t) => {
		const fakeScore = mkFakeScoreIIDXSP({
			scoreID: CreateScoreID(
				1,
				TestingIIDXSPDryScore,
				"c2311194e3897ddb5745b1760d2c0141f933e683"
			),
			highlight: false,
		});

		// add a score with an existing scoreID that is not highlighted.
		await db.scores.insert(fakeScore);

		t.equal(fakeScore.highlight, false, "The score should not be highlighted.");

		// this should mutate the state of the score in the DB.
		const res = await ConverterIRFervidex(
			deepmerge(baseFervidexScore, {
				ex_score: TestingIIDXSPDryScore.scoreData.score,
				clear_type: 4,
				chart: "spa",
				entry_id: 1000,

				// highlight an existing score
				highlight: true,
			}),
			{ version: "27", timeReceived: 10, userID: 1 },
			"ir/fervidex",
			logger
		);

		const dbRes = await db.scores.findOne({ scoreID: fakeScore.scoreID });

		t.equal(dbRes?.highlight, true, "The score should now be highlighted.");

		t.end();
	});

	t.end();
});
