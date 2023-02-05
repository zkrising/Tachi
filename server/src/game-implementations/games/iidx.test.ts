import { IIDX_DP_IMPL, IIDX_SP_IMPL } from "./iidx";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { CreatePBDoc } from "lib/score-import/framework/pb/create-pb-doc";
import { IIDX_GRADES, IIDX_LAMPS } from "tachi-common";
import t from "tap";
import { dmf, mkFakePBIIDXSP, mkFakeScoreIIDXSP } from "test-utils/misc";
import ResetDBState from "test-utils/resets";
import { TestSnapshot } from "test-utils/single-process-snapshot";
import { Testing511SPA, TestingIIDXSPScore } from "test-utils/test-data";
import type { ChartDocumentData, ProvidedMetrics, ScoreData } from "tachi-common";

const baseMetrics: ProvidedMetrics["iidx:DP" | "iidx:SP"] = {
	lamp: "HARD CLEAR",
	score: 1000,
};

const logger = CreateLogCtx(__filename);

const max = Testing511SPA.data.notecount * 2;

function percentToScore(percent: number) {
	return (percent / 100) * max;
}

function scoreToPercent(score: number) {
	return (100 * score) / max;
}

t.test("IIDX Implementation", (t) => {
	t.test("Derivers", (t) => {
		for (const impl of [IIDX_SP_IMPL, IIDX_DP_IMPL]) {
			t.test("Percent", (t) => {
				const f = (modifant: Partial<typeof baseMetrics>, expected: any, msg: string) =>
					t.equal(
						impl.derivers.percent(dmf(baseMetrics, modifant), Testing511SPA as any),
						expected,
						msg
					);

				f(
					{ score: 1000 },
					63.61323155216285,
					"An EXScore of 1000 should result in a percent of 1000 / (notecount*2)"
				);

				f({ score: 0 }, 0, "An EXScore of 0 should count as 0%.");

				f(
					{ score: Testing511SPA.data.notecount * 2 },
					100,
					"A perfect score should be worth 100%"
				);

				t.end();
			});

			t.test("Grade", (t) => {
				const f = (percent: number, expected: any) =>
					t.equal(
						impl.derivers.grade(
							dmf(baseMetrics, { score: percentToScore(percent) }),
							Testing511SPA as any
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
		}

		t.end();
	});

	t.test("Validators", (t) => {
		for (const [playtype, impl] of [
			["SP", IIDX_SP_IMPL],
			["DP", IIDX_DP_IMPL],
		] as const) {
			t.equal(impl.chartSpecificValidators.score(1000, Testing511SPA as any), true);
			t.equal(impl.chartSpecificValidators.score(0, Testing511SPA as any), true);
			t.equal(
				impl.chartSpecificValidators.score(
					Testing511SPA.data.notecount * 2,
					Testing511SPA as any
				),
				true
			);

			TestSnapshot(
				t,
				impl.chartSpecificValidators.score(-1, Testing511SPA as any),
				`EX Score Validator ${playtype}: negative`
			);
			TestSnapshot(
				t,
				impl.chartSpecificValidators.score(
					Testing511SPA.data.notecount * 2 + 1,
					Testing511SPA as any
				),
				`EX Score Validator ${playtype}: excessive`
			);
		}

		t.end();
	});

	t.test("CalculatedData", (t) => {
		for (const impl of [IIDX_SP_IMPL, IIDX_DP_IMPL]) {
			t.test("BPI", (t) => {
				const f = (
					scoreData: Partial<ScoreData<"iidx:DP" | "iidx:SP">>,
					chartData: Partial<ChartDocumentData["iidx:DP" | "iidx:DP"]>,
					expected: any,
					msg: string
				) =>
					t.equal(
						impl.scoreCalcs.BPI(
							dmf(TestingIIDXSPScore.scoreData, scoreData),
							dmf(Testing511SPA, { data: chartData as any }) as any
						),
						expected,
						msg
					);

				f(
					{ score: 123 },
					{ kaidenAverage: 123, worldRecord: 200 },
					0,
					"score == kaidenAverage should be 0"
				);

				f(
					{ score: 200 },
					{ kaidenAverage: 123, worldRecord: 200 },
					100,
					"score == WR should be 100"
				);
				f(
					{ score: 180 },
					{ kaidenAverage: 123, worldRecord: 200 },
					69.64067840359507,
					"general calc check"
				);
				f(
					{ score: 100 },
					{ kaidenAverage: 123, worldRecord: 200 },
					-15,
					"score < kavg should be negative"
				);

				t.end();
			});
		}

		t.test("ktLampRating IIDX SP", (t) => {
			const f = (
				scoreData: Partial<ScoreData<"iidx:SP">>,
				chartData: Partial<ChartDocumentData["iidx:SP"]>,
				expected: any,
				msg: string
			) =>
				t.equal(
					IIDX_SP_IMPL.scoreCalcs.ktLampRating(
						dmf(TestingIIDXSPScore.scoreData, scoreData),
						dmf(Testing511SPA, { data: chartData as any })
					),
					expected,
					msg
				);

			f({ lamp: "FAILED" }, {}, 0, "fails should be worth 0");
			f({ lamp: "ASSIST CLEAR" }, {}, 0, "ac should be worth 0");
			f({ lamp: "EASY CLEAR" }, {}, 0, "ec should be worth 0");
			f({ lamp: "CLEAR" }, {}, Testing511SPA.levelNum, "nc should be worth chart level");
			f({ lamp: "HARD CLEAR" }, {}, Testing511SPA.levelNum, "hc should be worth chart level");
			f(
				{ lamp: "EX HARD CLEAR" },
				{},
				Testing511SPA.levelNum,
				"exhc should be worth chart level"
			);
			f({ lamp: "FULL COMBO" }, {}, Testing511SPA.levelNum, "fc should be worth chart level");

			function mkTier(v: number) {
				return { value: v, text: "whatever", individualDifference: false };
			}

			f({ lamp: "CLEAR" }, { ncTier: mkTier(15) }, 15, "nc should be worth ncTier");
			f(
				{ lamp: "HARD CLEAR" },
				{ ncTier: mkTier(15), hcTier: mkTier(16) },
				16,
				"hc should be worth hcTier"
			);
			f(
				{ lamp: "EX HARD CLEAR" },
				{ ncTier: mkTier(15), hcTier: mkTier(16), exhcTier: mkTier(17) },
				17,
				"exhc should be worth exhcTier"
			);

			f(
				{ lamp: "HARD CLEAR" },
				{ ncTier: mkTier(15) },
				15,
				"hc should be worth ncTier if no hcTier defined"
			);

			f(
				{ lamp: "EX HARD CLEAR" },
				{ ncTier: mkTier(15) },
				15,
				"exhc should be worth ncTier if no exhcTier/hcTier defined"
			);
			f(
				{ lamp: "EX HARD CLEAR" },
				{ ncTier: mkTier(15), hcTier: mkTier(16) },
				16,
				"exhc should be worth hcTier if no exhcTier defined"
			);

			t.end();
		});

		t.test("ktLampRating IIDX SP", (t) => {
			const f = (
				scoreData: Partial<ScoreData<"iidx:DP">>,
				chartData: Partial<ChartDocumentData["iidx:DP"]>,
				expected: any,
				msg: string
			) =>
				t.equal(
					IIDX_DP_IMPL.scoreCalcs.ktLampRating(
						dmf(TestingIIDXSPScore.scoreData, scoreData),
						dmf(Testing511SPA as any, { data: chartData as any })
					),
					expected,
					msg
				);

			f({ lamp: "FAILED" }, {}, 0, "fails should be worth 0");
			f({ lamp: "ASSIST CLEAR" }, {}, 0, "ac should be worth 0");
			f({ lamp: "EASY CLEAR" }, {}, Testing511SPA.levelNum, "ec should be worth chart level");
			f({ lamp: "CLEAR" }, {}, Testing511SPA.levelNum, "nc should be worth chart level");
			f({ lamp: "HARD CLEAR" }, {}, Testing511SPA.levelNum, "hc should be worth chart level");
			f(
				{ lamp: "EX HARD CLEAR" },
				{},
				Testing511SPA.levelNum,
				"exhc should be worth chart level"
			);
			f({ lamp: "FULL COMBO" }, {}, Testing511SPA.levelNum, "fc should be worth chart level");

			function mkTier(v: number) {
				return { value: v, text: "whatever", individualDifference: false };
			}

			f({ lamp: "EASY CLEAR" }, { dpTier: mkTier(15) }, 15, "ec should be worth dpTier");
			f({ lamp: "CLEAR" }, { dpTier: mkTier(15) }, 15, "nc should be worth dpTier");
			f({ lamp: "HARD CLEAR" }, { dpTier: mkTier(15) }, 15, "hc should be worth dpTier");
			f({ lamp: "EX HARD CLEAR" }, { dpTier: mkTier(15) }, 15, "exhc should be worth dpTier");

			t.end();
		});

		t.end();
	});

	t.test("Goal Formatters", (t) => {
		for (const impl of [IIDX_SP_IMPL, IIDX_DP_IMPL]) {
			t.test("Criteria", (t) => {
				t.equal(impl.goalCriteriaFormatters.percent(94.42123), "Get 94.42% on");
				t.equal(impl.goalCriteriaFormatters.percent(94.426), "Get 94.43% on");

				t.equal(impl.goalCriteriaFormatters.score(1234), "Get a score of 1234 on");
				t.equal(impl.goalCriteriaFormatters.score(0), "Get a score of 0 on");

				t.end();
			});

			t.test("Progress", (t) => {
				const f = (
					k: keyof typeof impl.goalProgressFormatters,
					modifant: Partial<ScoreData>,
					goalValue: any,
					expected: any
				) =>
					t.equal(
						impl.goalProgressFormatters[k](
							mkFakePBIIDXSP({
								// @ts-expect-error lol deepmerge types
								scoreData: modifant,
							}),
							goalValue
						),
						expected
					);

				f("score", { score: 1234 }, 1000, "1234");
				f("score", { score: 0 }, 1000, "0");

				f("percent", { percent: 92.17472 }, 100, "92.17%");
				f("percent", { percent: 92.17572 }, 100, "92.18%");

				f(
					"grade",
					{ score: 1333, percent: scoreToPercent(1333), grade: "AA" },
					IIDX_GRADES.AAA,
					"AAA-64"
				);
				f(
					"grade",
					{ score: 1233, percent: scoreToPercent(1233), grade: "AA" },
					IIDX_GRADES.AAA,
					"AAA-164"
				);
				f(
					"grade",
					{ score: 1400, percent: scoreToPercent(1400), grade: "AAA" },
					IIDX_GRADES.AAA,
					"AAA+3"
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
				t.equal(impl.goalOutOfFormatters.score(1234), "1234");

				t.end();
			});
		}

		t.end();
	});

	t.test("PB Mergers", (t) => {
		t.beforeEach(ResetDBState);

		for (const gptStr of ["iidx:SP", "iidx:DP"] as const) {
			t.test("Should join best lamp", async (t) => {
				await db.scores.insert(
					mkFakeScoreIIDXSP({
						scoreID: "bestLamp",
						scoreData: {
							score: 0,
							lamp: "FULL COMBO",
							enumIndexes: { lamp: IIDX_LAMPS.FULL_COMBO },
						},
					})
				);

				t.hasStrict(await CreatePBDoc(gptStr, 1, Testing511SPA, logger), {
					composedFrom: [
						{ name: "Best Score" },
						{ name: "Best Lamp", scoreID: "bestLamp" },
					],
					scoreData: {
						score: 786,
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
					mkFakeScoreIIDXSP({
						scoreID: "whateverBP",
						scoreData: { optional: { bp: 100 } },
					}),
					mkFakeScoreIIDXSP({
						scoreID: "lowestBP",
						scoreData: { optional: { bp: 1 } },
					}),
					mkFakeScoreIIDXSP({
						scoreID: "nullBP",
						scoreData: { optional: { bp: null } },
					}),
				]);

				t.hasStrict(await CreatePBDoc(gptStr, 1, Testing511SPA, logger), {
					composedFrom: [
						{ name: "Best Score" },
						{ name: "Lowest BP", scoreID: "lowestBP" },
					],
					scoreData: {
						score: 786,
						optional: { bp: 1 },
					},
				});

				t.end();
			});
		}

		t.end();
	});

	t.end();
});
