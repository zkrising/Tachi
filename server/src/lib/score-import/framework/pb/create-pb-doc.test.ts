import { CreatePBDoc } from "./create-pb-doc";
import deepmerge from "deepmerge";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { IIDX_GRADES, IIDX_LAMPS } from "tachi-common";
import t from "tap";
import ResetDBState from "test-utils/resets";
import {
	BMSGazerChart,
	Testing511SPA,
	TestingBMS7KScore,
	TestingIIDXSPScore,
} from "test-utils/test-data";
import type { PBScoreDocumentNoRank } from "./create-pb-doc";
import type { KtLogger } from "lib/logger/logger";

const IIDXScore = TestingIIDXSPScore;

const logger = CreateLogCtx(__filename);

t.test("#CreatePBDoc", (t) => {
	t.beforeEach(ResetDBState);

	const chartID = Testing511SPA.chartID;

	const ExamplePBDoc = {
		chartID,
		userID: 1,
		songID: 1,

		// rankingData -- is not present because it is not added until post-processing.
		highlight: false,
		isPrimary: true,
		timeAchieved: 1619454485988,
		game: "iidx",
		playtype: "SP",
		composedFrom: [
			{ name: "Best Score", scoreID: IIDXScore.scoreID },
			{ name: "Best Lamp", scoreID: "LAMP_PB_ID" },
		],
		scoreData: {
			score: IIDXScore.scoreData.score,
			percent: IIDXScore.scoreData.percent,
			grade: IIDXScore.scoreData.grade,
			judgements: IIDXScore.scoreData.judgements,
			lamp: "FULL COMBO",
			enumIndexes: {
				lamp: IIDX_LAMPS.FULL_COMBO,
				grade: IIDX_GRADES.C,
			},
			optional: { bp: 1, enumIndexes: {} },
		},
		calculatedData: {
			BPI: null,
			ktLampRating: 10,
		},
	};

	t.test(
		"(IIDX) Should use the Server Impl Merge FNs to also join the BP PB if necessary.",
		async (t) => {
			await db.scores.remove({});
			await db.scores.insert([
				IIDXScore,
				deepmerge(IIDXScore, {
					scoreData: {
						lamp: "FULL COMBO",
						score: 0,
						percent: 0,
						optional: {
							bp: 15,
						},
						enumIndexes: {
							lamp: IIDX_LAMPS.FULL_COMBO,
						},
					},
					scoreID: "LAMP_PB_ID",
				}),
				deepmerge(IIDXScore, {
					scoreData: {
						lamp: "CLEAR",
						score: 1,
						percent: 1,
						optional: {
							bp: 5,
						},
						enumIndexes: {
							lamp: IIDX_LAMPS.CLEAR,
						},
					},
					scoreID: "BP_PB_ID",
				}),
			]);

			const res = await CreatePBDoc("iidx:SP", 1, Testing511SPA, logger);

			t.not(res, undefined, "Should actually return something.");

			t.strictSame(
				res,
				deepmerge(ExamplePBDoc, {
					composedFrom: [{ name: "Lowest BP", scoreID: "BP_PB_ID" }],

					scoreData: {
						optional: {
							bp: 5,
						},
					},
				}),
				"Should correctly return a merged PBDocument with BP"
			);

			t.end();
		}
	);

	t.test("Should merge a score and lamp PB into one document.", async (t) => {
		const d = deepmerge(IIDXScore, {
			scoreData: {
				lamp: "FULL COMBO",
				score: 0,
				percent: 0,
				optional: {
					bp: 1,
				},
				enumIndexes: {
					lamp: IIDX_LAMPS.FULL_COMBO,
				},
			},
			calculatedData: {
				ktLampRating: 12,
			},
			scoreID: "LAMP_PB_ID",
		});

		await db.scores.remove({});
		await db.scores.insert([IIDXScore, d]);

		const res = await CreatePBDoc("iidx:SP", 1, Testing511SPA, logger);

		t.not(res, undefined, "Should actually return something.");

		t.strictSame(res, ExamplePBDoc, "Should correctly return a merged PBDocument");

		t.end();
	});

	t.test("Should bail safely if no score exists when one should", async (t) => {
		// a work of genius <- zkldi, june 2021
		// a work of stupidity <- zkldi, after this broke, in december 2022.
		const fakeLogger = {
			warn: () => (warnCalled = true),
		} as unknown as KtLogger;

		let warnCalled = false;

		await db.scores.remove({});

		const res = await CreatePBDoc("iidx:SP", 1, Testing511SPA, fakeLogger);

		t.equal(res, undefined, "Should return nothing (and emit a warning)");

		t.equal(warnCalled, true, "Warn logging should have been called.");

		t.end();
	});

	t.test("(BMS) Should inherit BP from the best BP score.", async (t) => {
		await db.scores.remove({});
		await db.scores.insert([
			TestingBMS7KScore,
			deepmerge(TestingBMS7KScore, {
				scoreData: {
					lamp: "FULL COMBO",
					score: 0,
					percent: 0,
					optional: {
						bp: 15,
					},
					enumIndexes: {
						lamp: IIDX_LAMPS.FULL_COMBO,
					},
				},
				calculatedData: {
					sieglinde: 500,
				},
				scoreID: "LAMP_PB_ID",
			}),
			deepmerge(TestingBMS7KScore, {
				scoreData: {
					optional: {
						bp: 1,
					},
				},
				scoreID: "BP_PB_ID",
			}),
		]);

		const res = (await CreatePBDoc("bms:7K", 1, BMSGazerChart, logger)) as
			| PBScoreDocumentNoRank<"bms:7K" | "bms:14K">
			| undefined;

		t.not(res, undefined, "Should actually return something.");

		t.equal(
			res?.scoreData.optional.bp,
			1,
			"Should select the best BP's BP and not the score PBs."
		);

		t.strictSame(res?.composedFrom, [
			{ name: "Best Score", scoreID: TestingBMS7KScore.scoreID },
			{ name: "Best Lamp", scoreID: "LAMP_PB_ID" },
			{ name: "Lowest BP", scoreID: "BP_PB_ID" },
		]);

		t.end();
	});

	t.test("(BMS) Should inherit graph data from the best lamp.", async (t) => {
		await db.scores.remove({});
		await db.scores.insert([
			TestingBMS7KScore,
			deepmerge(TestingBMS7KScore, {
				scoreData: {
					lamp: "FULL COMBO",
					score: 0,
					percent: 0,
					optional: {
						bp: 15,
						gauge: 12,
						gaugeHistory: [20, 20, 21, 12],
						gaugeHistoryEasy: [20, 20, 21, 13],
						gaugeHistoryGroove: [20, 20, 21, 14],
						gaugeHistoryHard: [20, 20, 21, 15],
					},
					enumIndexes: {
						lamp: IIDX_LAMPS.FULL_COMBO,
					},
				},
				calculatedData: {
					sieglinde: 500,
				},
				scoreID: "LAMP_PB_ID",
			}),
		]);

		const res = (await CreatePBDoc("bms:7K", 1, BMSGazerChart, logger)) as
			| PBScoreDocumentNoRank<"bms:7K" | "bms:14K">
			| undefined;

		t.not(res, undefined, "Should actually return something.");

		t.hasStrict(
			res?.scoreData.optional,
			{
				gauge: 12,
				gaugeHistory: [20, 20, 21, 12],
				gaugeHistoryEasy: [20, 20, 21, 13],
				gaugeHistoryGroove: [20, 20, 21, 14],
				gaugeHistoryHard: [20, 20, 21, 15],
			},
			"Should select the lampPBs gauge data and not the score PBs."
		);

		t.end();
	});

	t.end();
});
