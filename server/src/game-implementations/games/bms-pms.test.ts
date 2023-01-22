import { BMS_14K_IMPL, BMS_7K_IMPL, PMS_CONTROLLER_IMPL, PMS_KEYBOARD_IMPL } from "./bms-pms";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { CreatePBDoc } from "lib/score-import/framework/pb/create-pb-doc";
import { GetGPTString, IIDX_GRADES, IIDX_LAMPS } from "tachi-common";
import t from "tap";
import { dmf, mkMockPB, mkMockScore } from "test-utils/misc";
import ResetDBState from "test-utils/resets";
import { TestSnapshot } from "test-utils/single-process-snapshot";
import type {
	ChartDocument,
	GPTStrings,
	ProvidedMetrics,
	ScoreData,
	ChartDocumentData,
} from "tachi-common";

type BMSPMS = GPTStrings["bms" | "pms"];

const max = 2256 * 2;

const baseMetrics: ProvidedMetrics[BMSPMS] = {
	lamp: "CLEAR",
	score: Math.floor(percentToScore(79.123)),
};

const scoreData: ScoreData<BMSPMS> = {
	lamp: "CLEAR",
	score: Math.floor(percentToScore(79.123)),
	grade: "AA",
	percent: 79.123,
	enumIndexes: { grade: IIDX_GRADES.AA, lamp: IIDX_LAMPS.CLEAR },
	judgements: {},
	optional: { enumIndexes: {} },
};

function percentToScore(percent: number) {
	return (percent / 100) * max;
}

function scoreToPercent(score: number) {
	return (100 * score) / max;
}

const logger = CreateLogCtx(__filename);

for (const [game, playtype, impl] of [
	["bms", "7K", BMS_7K_IMPL],
	["bms", "14K", BMS_14K_IMPL],
	["pms", "Controller", PMS_CONTROLLER_IMPL],
	["pms", "Keyboard", PMS_KEYBOARD_IMPL],
] as const) {
	const chart: ChartDocument<BMSPMS> = {
		songID: 27339,
		chartID: "88eb6cc5683e2740cbd07f588a5f3db1db8d467b",
		data: {
			aiLevel: "0",
			notecount: 2256,
			hashMD5: "38616b85332037cc12924f2ae2840262",
			hashSHA256: "195fe1be5c3e74fccd04dc426e05f8a9cfa8a1059c339d0a23e99f63661f0b7d",
			tableFolders: [
				{
					level: "17",
					table: "★",
				},
			],
			sglEC: null,
			sglHC: null,
		},
		level: "?",
		levelNum: 0,
		difficulty: "CHART",
		playtype,
		isPrimary: true,
		versions: [],
	};

	const mockScore = mkMockScore(game, playtype, chart, scoreData);
	const mockPB = mkMockPB(game, playtype, chart, scoreData);
	const gptStr = GetGPTString(game, playtype);

	t.test("Derivers", (t) => {
		t.test("Percent", (t) => {
			const f = (modifant: Partial<typeof baseMetrics>, expected: any, msg: string) =>
				t.equal(
					impl.derivers.percent(dmf(baseMetrics, modifant), chart as any),
					expected,
					msg
				);

			f(
				{ score: 1000 },
				(100 * 1000) / max,
				"An EXScore of 1000 should result in a percent of 1000 / (notecount*2)"
			);

			f({ score: 0 }, 0, "An EXScore of 0 should count as 0%.");

			f({ score: chart.data.notecount * 2 }, 100, "A perfect score should be worth 100%");

			t.end();
		});

		t.test("Grade", (t) => {
			const f = (percent: number, expected: any) =>
				t.equal(
					impl.derivers.grade(
						dmf(baseMetrics, { score: percentToScore(percent) }),
						chart as any
					),
					expected,
					`A percent of ${percent}% should result in grade=${expected}.`
				);

			f(0, "F");
			f(22.23, "E");
			f(33.34, "D");
			f(44.45, "C");
			f(55.56, "B");
			f(66.67, "A");
			f(77.78, "AA");
			f(88.89, "AAA");
			f(94.45, "MAX-");
			f(100, "MAX");

			// almosts
			f(0, "F");
			f(11.11, "F");
			f(22.22, "F");
			f(33.33, "E");
			f(44.44, "D");
			f(55.55, "C");
			f(66.66, "B");
			f(77.77, "A");
			f(88.88, "AA");
			f(94.44, "AAA");
			f(99.99, "MAX-");

			t.end();
		});

		t.end();
	});

	t.test("Validators", (t) => {
		t.equal(impl.chartSpecificValidators.score(1000, chart as any), true);
		t.equal(impl.chartSpecificValidators.score(0, chart as any), true);
		t.equal(impl.chartSpecificValidators.score(chart.data.notecount * 2, chart as any), true);

		TestSnapshot(
			t,
			impl.chartSpecificValidators.score(-1, chart as any),
			`EX Score Validator ${playtype}: negative`
		);
		TestSnapshot(
			t,
			impl.chartSpecificValidators.score(chart.data.notecount * 2 + 1, chart as any),
			`EX Score Validator ${playtype}: excessive`
		);

		t.end();
	});

	t.test("CalculatedData", (t) => {
		t.test("Sieglinde", (t) => {
			const f = (
				scoreData: Partial<ScoreData<BMSPMS>>,
				chartData: Partial<ChartDocumentData[BMSPMS]>,
				expected: any,
				msg: string
			) =>
				t.equal(
					impl.scoreCalcs.sieglinde(
						dmf(mockScore.scoreData, scoreData),
						// @ts-expect-error zzz
						dmf(chart, { data: chartData as any })
					),
					expected,
					msg
				);

			t.test("null sieglinde", (t) => {
				f({ lamp: "FAILED" }, {}, 0, "fails should be worth 0");
				f({ lamp: "ASSIST CLEAR" }, {}, 0, "ac should be worth 0");
				f({ lamp: "EASY CLEAR" }, {}, 0, "ec should be worth 0");
				f({ lamp: "CLEAR" }, {}, 0, "nc should be worth 0");
				f({ lamp: "HARD CLEAR" }, {}, 0, "hc should be worth 0");
				f({ lamp: "EX HARD CLEAR" }, {}, 0, "exhc should be worth 0");
				f({ lamp: "FULL COMBO" }, {}, 0, "fc should be worth 0");

				t.end();
			});

			f({ lamp: "FAILED" }, { sglEC: 10, sglHC: 11 }, 0, "fails should be worth 0");
			f({ lamp: "ASSIST CLEAR" }, { sglEC: 10, sglHC: 11 }, 0, "ac should be worth 0");
			f({ lamp: "EASY CLEAR" }, { sglEC: 10, sglHC: 11 }, 10, "ec should be worth sglEC");
			f({ lamp: "CLEAR" }, { sglEC: 10, sglHC: 11 }, 10, "nc should be worth sglEC");
			f({ lamp: "HARD CLEAR" }, { sglEC: 10, sglHC: 11 }, 11, "hc should be worth sglHC");
			f(
				{ lamp: "EX HARD CLEAR" },
				{ sglEC: 10, sglHC: 11 },
				11,
				"exhc should be worth sglHC"
			);
			f({ lamp: "FULL COMBO" }, { sglEC: 10, sglHC: 11 }, 11, "fc should be worth sglHC");

			f({ lamp: "HARD CLEAR" }, { sglEC: 10 }, 10, "hc should fallback to EC");
			f({ lamp: "EX HARD CLEAR" }, { sglEC: 10 }, 10, "exhc should fallback to EC");
			f({ lamp: "FULL COMBO" }, { sglEC: 10 }, 10, "fc should fallback to EC");

			t.end();
		});

		t.end();
	});

	t.test("Goal Formatters", (t) => {
		t.test("Criteria", (t) => {
			t.equal(impl.goalCriteriaFormatters.percent(94.42123), "Get 94.42% on");
			t.equal(impl.goalCriteriaFormatters.percent(94.426), "Get 94.43% on");

			t.equal(impl.goalCriteriaFormatters.score(3570), "Get a score of 3570 on");
			t.equal(impl.goalCriteriaFormatters.score(0), "Get a score of 0 on");

			t.end();
		});

		t.test("Progress", (t) => {
			const f = (
				k: keyof typeof impl.goalProgressFormatters,
				modifant: Partial<ScoreData<BMSPMS>>,
				goalValue: any,
				expected: any
			) =>
				t.equal(
					impl.goalProgressFormatters[k](
						dmf(mockPB, {
							scoreData: modifant,
						}),
						goalValue
					),
					expected
				);

			f("score", { score: 3570 }, 1000, "3570");
			f("score", { score: 0 }, 1000, "0");

			f("percent", { percent: 92.17472 }, 100, "92.17%");
			f("percent", { percent: 92.17572 }, 100, "92.18%");

			f(
				"grade",
				{ score: 3570, percent: scoreToPercent(3570), grade: "AA" },
				IIDX_GRADES.AAA,
				"AAA-441"
			);
			f(
				"grade",
				{ score: 3670, percent: scoreToPercent(3670), grade: "AA" },
				IIDX_GRADES.AAA,
				"AAA-341"
			);
			f(
				"grade",
				{ score: 4070, percent: scoreToPercent(4070), grade: "AAA" },
				IIDX_GRADES.AAA,
				"AAA+59"
			);

			f(
				"lamp",
				{ lamp: "HARD CLEAR", optional: { bp: 2 } as any },
				IIDX_LAMPS.HARD_CLEAR,
				"HARD CLEAR (BP: 2)"
			);

			f(
				"lamp",
				{ lamp: "HARD CLEAR", optional: { bp: null } as any },
				IIDX_LAMPS.HARD_CLEAR,
				"HARD CLEAR"
			);

			t.end();
		});

		t.test("OutOf", (t) => {
			t.equal(impl.goalOutOfFormatters.percent(94.42123), "94.42%");
			t.equal(impl.goalOutOfFormatters.score(3570), "3570");

			t.end();
		});

		t.end();
	});

	t.test("PB Mergers", (t) => {
		t.beforeEach(ResetDBState);
		t.beforeEach(() => db.scores.insert(mockScore));

		t.test("Should join best lamp", async (t) => {
			await db.scores.insert(
				dmf(mockScore, {
					scoreID: "bestLamp",
					scoreData: {
						score: 0,
						lamp: "FULL COMBO",
						enumIndexes: { lamp: IIDX_LAMPS.FULL_COMBO },
					},
				})
			);

			t.hasStrict(await CreatePBDoc(gptStr, 1, chart, logger), {
				composedFrom: [{ name: "Best Score" }, { name: "Best Lamp", scoreID: "bestLamp" }],
				scoreData: {
					score: 3570,
					lamp: "FULL COMBO",
					enumIndexes: {
						lamp: IIDX_LAMPS.FULL_COMBO,
					},
				},
			});

			t.end();
		});

		t.test("Should join best BP", async (t) => {
			await db.scores.insert([
				dmf(mockScore, {
					scoreID: "whateverBP",
					scoreData: { optional: { bp: 100 } },
				}),
				dmf(mockScore, {
					scoreID: "lowestBP",
					scoreData: { optional: { bp: 1 } },
				}),
			]);

			t.hasStrict(await CreatePBDoc(gptStr, 1, chart, logger), {
				composedFrom: [{ name: "Best Score" }, { name: "Lowest BP", scoreID: "lowestBP" }],
				scoreData: {
					score: 3570,
					optional: { bp: 1 },
				},
			});

			t.end();
		});

		t.end();
	});

	t.end();
}
