import { MAIMAI_IMPL } from "./maimai";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { CreatePBDoc } from "lib/score-import/framework/pb/create-pb-doc";
import { MAIMAI_SINGLE_CONF } from "tachi-common/config/game-support/maimai";
import t from "tap";
import { mkMockScore, mkMockPB, dmf } from "test-utils/misc";
import ResetDBState from "test-utils/resets";
import { TestSnapshot } from "test-utils/single-process-snapshot";
import { TestingMaimaiChart } from "test-utils/test-data";
import type { ProvidedMetrics, ScoreData } from "tachi-common";

const logger = CreateLogCtx(__filename);

const baseMetrics: ProvidedMetrics["maimai:Single"] = {
	lamp: "CLEAR",
	percent: 97.012,
};

const GRADES = MAIMAI_SINGLE_CONF.derivedMetrics.grade.values;
const LAMPS = MAIMAI_SINGLE_CONF.providedMetrics.lamp.values;

const scoreData: ScoreData<"maimai:Single"> = {
	lamp: "CLEAR",
	percent: 97.012,
	grade: "S",
	judgements: {},
	optional: { enumIndexes: {} },
	enumIndexes: {
		grade: GRADES.indexOf("S"),
		lamp: LAMPS.indexOf("CLEAR"),
	},
};

const mockScore = mkMockScore("maimai", "Single", TestingMaimaiChart, scoreData);
const mockPB = mkMockPB("maimai", "Single", TestingMaimaiChart, scoreData);

t.test("maimai Implementation", (t) => {
	t.test("Percent Validator", (t) => {
		t.equal(MAIMAI_IMPL.chartSpecificValidators.percent(100.78, TestingMaimaiChart), true);
		t.equal(MAIMAI_IMPL.chartSpecificValidators.percent(0, TestingMaimaiChart), true);

		TestSnapshot(
			t,
			MAIMAI_IMPL.chartSpecificValidators.percent(-1, TestingMaimaiChart),
			`maimai Percent Validator: negative`
		);

		TestSnapshot(
			t,
			MAIMAI_IMPL.chartSpecificValidators.percent(101, TestingMaimaiChart),
			`maimai Percent Validator: over max percent`
		);
	});

	t.test("Grade Deriver", (t) => {
		const f = (percent: number, expected: any) =>
			t.equal(
				MAIMAI_IMPL.derivers.grade(dmf(baseMetrics, { percent }), TestingMaimaiChart),
				expected,
				`A percent of ${percent} should result in grade=${expected}.`
			);

		f(0, "F");
		f(10, "E");
		f(20, "D");
		f(40, "C");
		f(60, "B");
		f(80, "A");
		f(90, "AA");
		f(94, "AAA");
		f(97, "S");
		f(98, "S+");
		f(99, "SS");
		f(99.5, "SS+");
		f(100, "SSS");

		t.end();
	});

	t.todo("Score Calcs");
	t.todo("Session Calcs");
	t.todo("Profile Calcs");

	t.test("Colour Deriver", (t) => {
		const f = (v: number | null, expected: any) =>
			t.equal(
				MAIMAI_IMPL.classDerivers.colour({ naiveRate: v }),
				expected,
				`A rate of ${v} should result in ${expected}.`
			);

		f(null, null);
		f(0, "WHITE");

		f(15, "RAINBOW");
		f(14.5, "GOLD");
		f(14, "SILVER");
		f(13, "BRONZE");
		f(12, "PURPLE");
		f(10, "RED");
		f(7, "YELLOW");
		f(4, "GREEN");
		f(2, "BLUE");

		t.end();
	});

	t.test("Goal Formatters", (t) => {
		t.test("Criteria", (t) => {
			t.equal(MAIMAI_IMPL.goalCriteriaFormatters.percent(93.14), "Get 93.14% on");

			t.end();
		});

		t.test("Progress", (t) => {
			const f = (
				k: keyof typeof MAIMAI_IMPL.goalProgressFormatters,
				modifant: Partial<ScoreData<"maimai:Single">>,
				goalValue: any,
				expected: any
			) =>
				t.equal(
					MAIMAI_IMPL.goalProgressFormatters[k](
						dmf(mockPB, {
							scoreData: modifant,
						}),
						goalValue
					),
					expected
				);

			f("grade", { grade: "S", percent: 97.5 }, GRADES.indexOf("SS"), "(S+)-0.50%");
			f("percent", { percent: 98.23 }, 1_000_000, "98.23%");
			f("lamp", { lamp: "CLEAR" }, LAMPS.indexOf("CLEAR"), "CLEAR");

			t.end();
		});

		t.test("Out Of", (t) => {
			t.equal(MAIMAI_IMPL.goalOutOfFormatters.percent(99.11), "99.11%");

			t.end();
		});

		t.end();
	});

	t.test("PB Merging", (t) => {
		t.beforeEach(ResetDBState);

		t.test("Should join best lamp", async (t) => {
			await db.scores.insert(mockScore);
			await db.scores.insert(
				dmf(mockScore, {
					scoreID: "bestLamp",
					scoreData: {
						percent: 0,
						lamp: "FULL COMBO",
						enumIndexes: { lamp: LAMPS.indexOf("FULL COMBO") },
					},
				})
			);

			t.hasStrict(await CreatePBDoc("maimai:Single", 1, TestingMaimaiChart, logger), {
				composedFrom: [
					{ name: "Best Percent" },
					{ name: "Best Lamp", scoreID: "bestLamp" },
				],
				scoreData: {
					percent: mockScore.scoreData.percent,
					lamp: "FULL COMBO",
					enumIndexes: { lamp: LAMPS.indexOf("FULL COMBO") },
				},
			});

			t.end();
		});

		t.end();
	});

	t.end();
});
