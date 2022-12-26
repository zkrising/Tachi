import { ConverterIRBarbatos } from "./converter";
import deepmerge from "deepmerge";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import t from "tap";
import ResetDBState from "test-utils/resets";
import { MockBarbatosScore, MockBarbatosSDVX6Score } from "test-utils/test-data";
import type { BarbatosScore } from "./types";

const logger = CreateLogCtx(__filename);

t.test("#ConverterIRBarbatos", (t) => {
	t.beforeEach(ResetDBState);

	const albidaSong = {
		title: "ALBIDA Powerless Mix",
		artist: "無力P",
		id: 1,
		altTitles: [],
		searchTerms: ["albida_muryoku", "ｱﾙﾋﾞﾀﾞﾊﾟﾜｰﾚｽﾐｯｸｽ"],
		data: {
			uscEquiv: null,
			displayVersion: "booth",
		},
	};

	const albidaChart = {
		rgcID: null,
		chartID: "5088a4d0e1ee9d0cc2f625934306e45b1a60699b",
		difficulty: "ADV",
		songID: 1,
		playtype: "Single",
		levelNum: 10,
		level: "10",
		data: {
			inGameID: 1,
		},
		isPrimary: true,
		versions: ["booth", "inf", "gw", "heaven", "vivid", "exceed"],
	};

	t.test("Should convert a BarbatosScore into a Dry Score", async (t) => {
		const res = await ConverterIRBarbatos(
			MockBarbatosScore,
			{ timeReceived: 10, version: "vivid" },
			"ir/barbatos",
			logger
		);

		t.hasStrict(res, {
			song: albidaSong,
			chart: albidaChart,
			dryScore: {
				game: "sdvx",
				service: "Barbatos (vivid)",
				comment: null,
				importType: "ir/barbatos",

				// timeAchieved: , its Date.now() give or take lol
				scoreData: {
					score: 9000000,
					percent: 90,
					grade: "A+",
					lamp: "CLEAR",
					judgements: {
						critical: 100,
						near: 50,
						miss: 5,
					},
					hitMeta: {
						fast: 40,
						slow: 10,
						gauge: 90,
						maxCombo: 100,
						exScore: null,
					},
				},
				scoreMeta: {
					inSkillAnalyser: false,
				},
			},
		});

		t.end();
	});

	t.test("Should convert a BarbatosSDVX6Score into a Dry Score", async (t) => {
		const res = await ConverterIRBarbatos(
			MockBarbatosSDVX6Score,
			{ timeReceived: 10, version: "exceed" },
			"ir/barbatos",
			logger
		);

		t.hasStrict(res, {
			song: albidaSong,
			chart: albidaChart,
			dryScore: {
				game: "sdvx",
				service: "Barbatos (exceed)",
				comment: null,
				importType: "ir/barbatos",

				// timeAchieved: , its Date.now() give or take lol
				scoreData: {
					score: 9000000,
					percent: 90,
					grade: "A+",
					lamp: "CLEAR",
					judgements: {
						critical: 26,
						near: 2,
						miss: 17,
					},
					hitMeta: {
						fast: 6,
						slow: 9,
						gauge: 90,
						maxCombo: 100,
						exScore: 1234,
					},
				},
				scoreMeta: {
					inSkillAnalyser: null,
				},
			},
		});

		t.end();
	});

	t.test("Should throw SongOrChartNotFound if chart not found.", (t) => {
		t.rejects(
			() =>
				ConverterIRBarbatos(
					deepmerge(MockBarbatosScore, { song_id: 1000 }) as BarbatosScore,
					{ timeReceived: 10, version: "vivid" },
					"ir/barbatos",
					logger
				),
			{
				message: /Could not find chart with songID 1000/u,
			}
		);

		t.end();
	});

	t.test("Should honor provided context.version, and match accordingly.", async (t) => {
		// remove vividwave from the set of charts that this chart appears in.
		await db.charts.sdvx.update(
			{
				"data.inGameID": 1,
			},
			{
				$pull: {
					versions: "vivid",
				},
			}
		);

		t.rejects(
			() =>
				ConverterIRBarbatos(
					MockBarbatosScore,
					{ timeReceived: 10, version: "vivid" },
					"ir/barbatos",
					logger
				),
			{
				message: /Could not find chart with songID 1/u,
			}
		);

		t.end();
	});

	t.test("Should throw InternalFailure if song-chart desync.", async (t) => {
		// force a song-chart desync
		await db.songs.sdvx.remove({ id: 1 });

		t.rejects(
			() =>
				ConverterIRBarbatos(
					MockBarbatosScore,
					{ timeReceived: 10, version: "vivid" },
					"ir/barbatos",
					logger
				),
			{
				message: /Song 1 \(sdvx\) has no parent song/u,
			}
		);

		t.end();
	});

	t.end();
});
