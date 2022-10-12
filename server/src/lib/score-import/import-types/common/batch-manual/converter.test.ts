import { ConverterBatchManual, ResolveChartFromSong, ResolveMatchTypeToKTData } from "./converter";
import { InvalidScoreFailure } from "../../../framework/common/converter-failures";
import deepmerge from "deepmerge";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import t from "tap";
import ResetDBState from "test-utils/resets";
import {
	BMSGazerChart,
	BMSGazerSong,
	Testing511Song,
	Testing511SPA,
	TestingSDVXAlbidaChart,
} from "test-utils/test-data";
import { EscapeStringRegexp } from "utils/misc";
import type { BatchManualContext } from "./types";
import type { BatchManualScore, ChartDocument, Game } from "tachi-common";

const baseBatchManualScore = {
	score: 500,
	lamp: "HARD CLEAR" as const,
	matchType: "tachiSongID" as const,
	identifier: "1",
	playtype: "SP" as const,
	difficulty: "ANOTHER" as const,
};

const context = {
	game: "iidx" as const,
	playtype: "SP" as const,
	service: "foo",
	version: null,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ktdWrap = (msg: string, game: Game = "iidx", version = null): any => ({
	importType: "file/batch-manual",
	message: new RegExp(EscapeStringRegexp(msg), "u"),
	converterContext: { game, service: "foo", version },

	// any under t.match rules.
	data: {},
});

const logger = CreateLogCtx(__filename);

const importType = "file/batch-manual" as const;

t.test("#ResolveMatchTypeToKTData", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should resolve for the songID if the matchType is songID", async (t) => {
		const res = await ResolveMatchTypeToKTData(
			baseBatchManualScore,
			context,
			importType,
			logger
		);

		t.hasStrict(
			res,
			{ song: { id: 1 }, chart: Testing511SPA },
			"Should return the right song and chart."
		);

		t.rejects(
			() =>
				ResolveMatchTypeToKTData(
					// eslint-disable-next-line lines-around-comment
					// @ts-expect-error bad
					deepmerge(baseBatchManualScore, { identifier: "90000" }),
					context,
					importType,
					logger
				),
			ktdWrap("Cannot find song with songID 90000")
		);

		t.end();
	});

	t.test("Should resolve for the song title if the matchType is songTitle", async (t) => {
		const res = await ResolveMatchTypeToKTData(
			deepmerge(baseBatchManualScore, { matchType: "songTitle", identifier: "5.1.1." }),
			context,
			importType,
			logger
		);

		t.hasStrict(
			res,
			{ song: { id: 1 }, chart: Testing511SPA },
			"Should return the right song and chart."
		);

		t.rejects(
			() =>
				ResolveMatchTypeToKTData(
					deepmerge(baseBatchManualScore, {
						matchType: "songTitle",
						identifier: "INVALID_TITLE",
					}),
					context,
					importType,
					logger
				),
			ktdWrap("Cannot find song with title INVALID_TITLE")
		);

		t.end();
	});

	t.test("Should resolve for the sdvx inGameID if matchType is sdvxInGameID", async (t) => {
		const res = await ResolveMatchTypeToKTData(
			{
				matchType: "sdvxInGameID",
				identifier: "1",
				difficulty: "ADV",
				lamp: "CLEAR",
				score: 9_000_001,
			},
			context,
			importType,
			logger
		);

		t.hasStrict(
			res,
			{ song: { id: 1 }, chart: { data: { inGameID: 1 } } },
			"Should return the right song and chart."
		);

		t.rejects(
			() =>
				ResolveMatchTypeToKTData(
					{
						matchType: "sdvxInGameID",
						identifier: "9999999",
						difficulty: "ADV",
						lamp: "CLEAR",
						score: 9_000_001,
					},
					context,
					importType,
					logger
				),
			ktdWrap("Cannot find SDVX chart with inGameID 9999999")
		);

		t.end();
	});

	t.test("Should support ANY_INF if matchType is sdvxInGameID", async (t) => {
		await db.charts.sdvx.insert(
			deepmerge(TestingSDVXAlbidaChart, {
				chartID: "fake_xcd",
				data: {
					arcChartID: "fake222",
				},
				difficulty: "XCD",
			} as ChartDocument<"sdvx:Single">)
		);

		const res = await ResolveMatchTypeToKTData(
			{
				matchType: "sdvxInGameID",
				identifier: "1",
				difficulty: "ANY_INF",
				lamp: "CLEAR",
				score: 9_000_001,
			},
			context,
			importType,
			logger
		);

		t.hasStrict(
			res,
			{ song: { id: 1 }, chart: { data: { inGameID: 1 }, difficulty: "XCD" } },
			"Should return the right song and chart."
		);

		t.end();
	});

	t.test("Should resolve for the bms chartHash if the matchType is bmsChartHash", async (t) => {
		const GAZER17MD5 = "38616b85332037cc12924f2ae2840262";
		const GAZER17SHA256 = "195fe1be5c3e74fccd04dc426e05f8a9cfa8a1059c339d0a23e99f63661f0b7d";

		const bmsContext: BatchManualContext = deepmerge(context, { game: "bms", playtype: "7K" });

		const resMD5 = await ResolveMatchTypeToKTData(
			deepmerge(baseBatchManualScore, {
				matchType: "bmsChartHash",
				identifier: GAZER17MD5,
			}),
			bmsContext,
			importType,
			logger
		);

		t.hasStrict(
			resMD5,
			{ song: BMSGazerSong, chart: BMSGazerChart },
			"Should return the right song and chart."
		);

		const resSHA256 = await ResolveMatchTypeToKTData(
			deepmerge(baseBatchManualScore, {
				matchType: "bmsChartHash",
				identifier: GAZER17SHA256,
			}),
			bmsContext,
			importType,
			logger
		);

		t.hasStrict(
			resSHA256,
			{ song: BMSGazerSong, chart: BMSGazerChart },
			"Should return the right song and chart."
		);

		t.rejects(
			() =>
				ResolveMatchTypeToKTData(
					deepmerge(baseBatchManualScore, {
						matchType: "bmsChartHash",
						identifier: "bad_hash",
					}),
					bmsContext,
					importType,
					logger
				),
			ktdWrap("Cannot find chart for hash ", "bms")
		);

		t.end();
	});

	t.test("Should resolve for the popn chartHash if the matchType is popnChartHash", async (t) => {
		const chartHash = "2c26d666fa7c907e85115dbb279c267c14a263d47b2d46a93f99eae49d779119";

		const popnContext: BatchManualContext = deepmerge(context, {
			game: "popn",
			playtype: "9B",
		});

		const res = await ResolveMatchTypeToKTData(
			deepmerge(baseBatchManualScore, {
				matchType: "popnChartHash",
				identifier: chartHash,
			}),
			popnContext,
			importType,
			logger
		);

		t.hasStrict(
			res,
			{
				song: { id: 1 },
				chart: {
					songID: 1,
					data: { hashSHA256: chartHash },
					playtype: "9B",
				},
			},
			"Should return the right song and chart."
		);

		t.end();
	});

	t.test("Should reject if popnChartHash is used while game is not popn", (t) => {
		const chartHash = "2c26d666fa7c907e85115dbb279c267c14a263d47b2d46a93f99eae49d779119";

		t.rejects(() =>
			ResolveMatchTypeToKTData(
				deepmerge(baseBatchManualScore, {
					matchType: "popnChartHash",
					identifier: chartHash,
				}),
				context,
				importType,
				logger
			)
		);

		t.end();
	});

	t.test("Should resolve for the usc chartHash if the matchType is uscChartHash", async (t) => {
		const chartHash = "USC_CHART_HASH";

		const uscContext: BatchManualContext = deepmerge(context, {
			game: "usc",
			playtype: "Controller",
		});

		const res = await ResolveMatchTypeToKTData(
			deepmerge(baseBatchManualScore, {
				matchType: "uscChartHash",
				identifier: chartHash,
			}),
			uscContext,
			importType,
			logger
		);

		t.hasStrict(
			res,
			{
				song: { id: 1 },
				chart: { songID: 1, chartID: "USC_CHART_ID", playtype: "Controller" },
			},
			"Should return the right song and chart."
		);

		t.end();
	});

	t.test("Should honor playtype in uscChartHash despite non-unique chartIDs.", (t) => {
		const chartHash = "USC_CHART_HASH";

		const uscContext: BatchManualContext = deepmerge(context, {
			game: "usc",
			playtype: "Keyboard",
		});

		t.rejects(
			() =>
				ResolveMatchTypeToKTData(
					deepmerge(baseBatchManualScore, {
						matchType: "uscChartHash",
						identifier: chartHash,
					}),
					uscContext,
					importType,
					logger
				),
			ktdWrap("Cannot find chart with hash USC_CHART_HASH", "usc")
		);

		t.end();
	});

	t.test("Should reject if ddrSongHash is called without game = ddr", (t) => {
		t.rejects(
			ResolveMatchTypeToKTData(
				deepmerge(baseBatchManualScore, {
					matchType: "ddrSongHash",
					playtype: "SP",
					difficulty: "DIFFICULT",
				}),
				context,
				importType,
				logger
			),
			new InvalidScoreFailure("Cannot use ddrSongHash lookup on iidx.")
		);

		t.end();
	});

	t.test("Should resolve for the ddr songHash if the matchType is ddrSongHash", async (t) => {
		const PUTY_ID = "DQlQ1DlPbq900oqdOo8l0d6I1lIOl99l";

		const res = await ResolveMatchTypeToKTData(
			deepmerge(baseBatchManualScore, {
				matchType: "ddrSongHash",
				identifier: PUTY_ID,
				playtype: "SP",
				difficulty: "DIFFICULT",
			}),
			deepmerge(context, { game: "ddr" }),
			importType,
			logger
		);

		t.hasStrict(
			res,
			{
				song: { id: 10 },
				chart: { chartID: "48024d36bbe76c9fed09c3ffdc19412925d1efd3" },
			},
			"Should return the right song and chart."
		);

		t.rejects(
			() =>
				ResolveMatchTypeToKTData(
					deepmerge(baseBatchManualScore, {
						matchType: "ddrSongHash",
						identifier: "Bad_ID",
						playtype: "SP",
						difficulty: "EXPERT",
					}),
					deepmerge(context, { game: "ddr" }),
					importType,
					logger
				),
			ktdWrap("Cannot find chart for songHash", "ddr")
		);

		t.end();
	});

	t.test("Should trigger failsave if invalid matchType is provided.", (t) => {
		t.rejects(
			() =>
				ResolveMatchTypeToKTData(
					deepmerge(baseBatchManualScore, {
						matchType: "BAD_MATCHTYPE",
					}),
					context,
					importType,
					logger
				),
			new InvalidScoreFailure(`Invalid matchType BAD_MATCHTYPE`)
		);

		t.end();
	});

	t.end();
});

t.test("#ResolveChartFromSong", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should return the chart for the song + ptdf", async (t) => {
		const res = await ResolveChartFromSong(
			Testing511Song,

			// has playtype + diff
			baseBatchManualScore,

			{ game: "iidx", service: "foo", playtype: "SP", version: null },
			importType
		);

		t.hasStrict(res, Testing511SPA);

		t.end();
	});

	t.test("Should throw an error if no difficulty is provided.", (t) => {
		t.rejects(
			() =>
				ResolveChartFromSong(
					Testing511Song,
					deepmerge(baseBatchManualScore, { difficulty: null }),
					{ game: "iidx", service: "foo", playtype: "SP", version: null },
					importType
				),
			new InvalidScoreFailure(
				`Missing 'difficulty' field, but was necessary for this lookup.`
			)
		);

		t.end();
	});

	t.test("Should throw an error if an invalid difficulty is provided.", (t) => {
		t.rejects(
			() =>
				ResolveChartFromSong(
					Testing511Song,
					deepmerge(baseBatchManualScore, {
						difficulty: "NOT_VALID_DIFFICULTY" as const,
					}),
					{ game: "iidx", service: "foo", playtype: "SP", version: null },
					importType
				),
			new InvalidScoreFailure(
				`Invalid Difficulty for iidx SP - Expected any of BEGINNER, NORMAL, HYPER, ANOTHER, LEGGENDARIA`
			)
		);

		t.end();
	});

	t.test("Should throw an error if no chart could be found.", (t) => {
		t.rejects(
			() =>
				ResolveChartFromSong(
					Testing511Song,

					// 511 has no legg (yet, lol)
					deepmerge(baseBatchManualScore, { difficulty: "LEGGENDARIA" as const }),
					{ game: "iidx", service: "foo", version: null, playtype: "SP" },
					importType
				),
			ktdWrap("Cannot find chart for 5.1.1. (SP LEGGENDARIA)")
		);

		t.end();
	});

	t.test("Should successfully lookup if version is provided.", async (t) => {
		const res = await ResolveChartFromSong(
			Testing511Song,
			baseBatchManualScore,
			{
				game: "iidx",
				service: "foo",
				playtype: "SP",
				version: "27",
			},
			importType
		);

		t.hasStrict(res, Testing511SPA);

		t.end();
	});

	t.end();
});

t.test("#ConverterFn", (t) => {
	t.test("Should produce a DryScore", async (t) => {
		const res = await ConverterBatchManual(
			baseBatchManualScore,
			{ game: "iidx", service: "foo", playtype: "SP", version: null },
			importType,
			logger
		);

		t.hasStrict(res, {
			chart: Testing511SPA,
			song: { id: 1 },
			dryScore: {
				game: "iidx",
				service: "foo (BATCH-MANUAL)",
				comment: null,
				importType: "file/batch-manual",
				timeAchieved: null,
				scoreData: {
					lamp: "HARD CLEAR",
					score: 500,
					grade: "E",

					// percent: 31.5, -- ish, FPA is hard.
					judgements: {},
					hitMeta: {},
				},
				scoreMeta: {},
			},
		});

		t.end();
	});

	t.test("Should cap pop'n grades at A if they failed.", async (t) => {
		const res = await ConverterBatchManual(
			{
				score: 99_000,
				lamp: "FAILED",
				difficulty: "Easy",
				matchType: "tachiSongID",
				identifier: "1",
			},
			{ game: "popn", service: "foo", playtype: "9B", version: null },
			importType,
			logger
		);

		t.hasStrict(res, {
			chart: { songID: 1, difficulty: "Easy" },
			song: { id: 1 },
			dryScore: {
				game: "popn",
				service: "foo (BATCH-MANUAL)",
				comment: null,
				importType: "file/batch-manual",
				timeAchieved: null,
				scoreData: {
					lamp: "FAILED",
					score: 99_000,
					grade: "A",
					judgements: {},
					hitMeta: {},
				},
				scoreMeta: {},
			},
		});

		t.end();
	});

	t.test("Should cap pop'n grades at A if they bordered AA.", async (t) => {
		const res = await ConverterBatchManual(
			{
				score: 90_000,
				lamp: "FAILED",
				difficulty: "Easy",
				matchType: "tachiSongID",
				identifier: "1",
			},
			{ game: "popn", service: "foo", playtype: "9B", version: null },
			importType,
			logger
		);

		t.hasStrict(res, {
			chart: { songID: 1, difficulty: "Easy" },
			song: { id: 1 },
			dryScore: {
				game: "popn",
				service: "foo (BATCH-MANUAL)",
				comment: null,
				importType: "file/batch-manual",
				timeAchieved: null,
				scoreData: {
					lamp: "FAILED",
					score: 90_000,
					grade: "A",
					judgements: {},
					hitMeta: {},
				},
				scoreMeta: {},
			},
		});

		t.end();
	});

	const baseJubeatScore: BatchManualScore = {
		percent: 10,
		score: 920_000,
		identifier: "1",
		lamp: "CLEAR",
		matchType: "tachiSongID",
		difficulty: "ADV",
	};

	t.test("Should use the provided percent parameter for jubeat", async (t) => {
		const res = await ConverterBatchManual(
			baseJubeatScore,
			{ game: "jubeat", service: "foo", playtype: "Single", version: null },
			importType,
			logger
		);

		t.hasStrict(res, {
			chart: { songID: 1, difficulty: "ADV", playtype: "Single" },
			song: { id: 1 },
			dryScore: {
				game: "jubeat",
				service: "foo (BATCH-MANUAL)",
				comment: null,
				importType: "file/batch-manual",
				timeAchieved: null,
				scoreData: {
					lamp: "CLEAR",
					score: 920_000,
					grade: "S",
					percent: 10,
					judgements: {},
					hitMeta: {},
				},
				scoreMeta: {},
			},
		});

		t.end();
	});

	t.test("Should throw if the percent parameter is not given for jubeat", (t) => {
		t.rejects(
			() =>
				ConverterBatchManual(
					deepmerge(baseJubeatScore, { percent: undefined }),
					{ game: "jubeat", service: "foo", playtype: "Single", version: null },
					importType,
					logger
				),
			{ message: /The percent field must be filled out/u }
		);

		t.end();
	});

	t.test(
		"Should throw if the percent parameter is too small for jubeat when the score is reasonably high",
		(t) => {
			t.rejects(
				() =>
					ConverterBatchManual(
						deepmerge(baseJubeatScore, { percent: 0.1, score: 100_000 } as Partial<
							BatchManualScore<"jubeat:Single">
						>),
						{ game: "jubeat", service: "foo", playtype: "Single", version: null },
						importType,
						logger
					),
				{
					message:
						"The percent you passed for this jubeat score was less than 1, but the score was above 100k. This is not possible. Have you sent percent as a number between 0 and 1?",
				}
			);

			t.end();
		}
	);

	t.test(
		"Should throw if the percent parameter is over 100 but the chart is not hard mode (for jubeat)",
		(t) => {
			t.rejects(
				() =>
					ConverterBatchManual(
						deepmerge<BatchManualScore>(baseJubeatScore, { percent: 110 }),
						{ game: "jubeat", service: "foo", playtype: "Single", version: null },
						importType,
						logger
					),
				{ message: /The percent field must be <= 100 for normal mode./u }
			);

			t.end();
		}
	);

	t.test("Should throw if the score parameter is invalid for jubeat", (t) => {
		t.rejects(
			() =>
				ConverterBatchManual(
					deepmerge<BatchManualScore>(baseJubeatScore, { score: 2_000_000 }),
					{ game: "jubeat", service: "foo", playtype: "Single", version: null },
					importType,
					logger
				),
			{ message: /The score field must be a positive integer/u }
		);

		t.end();
	});

	t.test("Should produce a with timeAchieved null if timeAchieved is 0", async (t) => {
		const res = await ConverterBatchManual(
			deepmerge(baseBatchManualScore, { timeAchieved: 0 }),
			{ game: "iidx", service: "foo", playtype: "SP", version: null },
			importType,
			logger
		);

		t.hasStrict(res, {
			chart: Testing511SPA,
			song: { id: 1 },
			dryScore: {
				game: "iidx",
				service: "foo (BATCH-MANUAL)",
				comment: null,
				importType: "file/batch-manual",
				timeAchieved: null,
				scoreData: {
					lamp: "HARD CLEAR",
					score: 500,
					grade: "E",

					// percent: 31.5, -- ish, FPA is hard.
					judgements: {},
					hitMeta: {},
				},
				scoreMeta: {},
			},
		});

		t.end();
	});

	t.test("Should reject a score with > 100%", (t) => {
		t.rejects(
			() =>
				ConverterBatchManual(
					// eslint-disable-next-line lines-around-comment
					// @ts-expect-error broken deepmerge
					deepmerge(baseBatchManualScore, { score: 2000 }),
					{ game: "iidx", service: "foo", playtype: "SP", version: null },
					importType,
					logger
				),
			{ message: /Invalid percent/u }
		);

		t.end();
	});

	t.end();
});
