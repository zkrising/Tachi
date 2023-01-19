import { POPN_9B_IMPL } from "./popn";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { CreatePBDoc } from "lib/score-import/framework/pb/create-pb-doc";
import { POPN_9B_CONF } from "tachi-common/config/game-support/popn";
import t from "tap";
import { dmf, mkMockPB, mkMockScore } from "test-utils/misc";
import ResetDBState from "test-utils/resets";
import { TestingPopnChart } from "test-utils/test-data";
import type { ProvidedMetrics, ScoreData } from "tachi-common";

const baseMetrics: ProvidedMetrics["popn:9B"] = {
	clearMedal: "clearCircle",
	score: 93_001,
};

const GRADES = POPN_9B_CONF.derivedMetrics.grade.values;
const LAMPS = POPN_9B_CONF.derivedMetrics.lamp.values;
const CLEAR_MEDALS = POPN_9B_CONF.providedMetrics.clearMedal.values;

const scoreData: ScoreData<"popn:9B"> = {
	lamp: "CLEAR",
	clearMedal: "clearCircle",
	score: 84_020,
	grade: "A",
	judgements: {},
	optional: { enumIndexes: {} },
	enumIndexes: {
		grade: GRADES.indexOf("S"),
		lamp: LAMPS.indexOf("CLEAR"),
		clearMedal: CLEAR_MEDALS.indexOf("clearCircle"),
	},
};

const mockScore = mkMockScore("popn", "9B", TestingPopnChart, scoreData);
const mockPB = mkMockPB("popn", "9B", TestingPopnChart, scoreData);

const logger = CreateLogCtx(__filename);

t.test("Pop'n Implementation", (t) => {
	t.test("Grade Deriver", (t) => {
		const f = (score: number, expected: any) =>
			t.equal(
				POPN_9B_IMPL.derivers.grade(dmf(baseMetrics, { score }), TestingPopnChart),
				expected,
				`A score of ${score.toLocaleString()} should result in grade=${expected}.`
			);

		f(0, "E");
		f(50_000, "D");
		f(62_000, "C");
		f(72_000, "B");
		f(82_000, "A");
		f(90_000, "AA");
		f(95_000, "AAA");
		f(98_000, "S");

		t.end();
	});

	t.test("Lamp Deriver", (t) => {
		const f = (clearMedal: ProvidedMetrics["popn:9B"]["clearMedal"], expected: any) =>
			t.equal(
				POPN_9B_IMPL.derivers.lamp(dmf(baseMetrics, { clearMedal }), TestingPopnChart),
				expected,
				`A clear medal of ${clearMedal} should result in lamp=${expected}.`
			);

		f("failedCircle", "FAILED");
		f("failedStar", "FAILED");
		f("failedDiamond", "FAILED");

		f("easyClear", "EASY CLEAR");

		f("clearCircle", "CLEAR");
		f("clearStar", "CLEAR");
		f("clearDiamond", "CLEAR");

		f("fullComboCircle", "FULL COMBO");
		f("fullComboStar", "FULL COMBO");
		f("fullComboDiamond", "FULL COMBO");

		f("perfect", "PERFECT");

		t.end();
	});

	t.todo("Score Calcs");
	t.todo("Session Calcs");
	t.todo("Profile Calcs");

	t.test("Class Deriver", (t) => {
		const f = (v: number | null, expected: any) =>
			t.equal(
				POPN_9B_IMPL.classDerivers.class({ naiveClassPoints: v }),
				expected,
				`Naive Class Points of ${v} should result in ${expected}.`
			);

		f(null, null);
		f(0, "KITTY");
		f(21, "STUDENT");
		f(34, "DELINQUENT");
		f(46, "DETECTIVE");
		f(59, "IDOL");
		f(68, "GENERAL");
		f(79, "HERMIT");
		f(91, "GOD");
		f(100, "GOD");

		t.end();
	});

	t.test("Goal Formatters", (t) => {
		t.test("Criteria", (t) => {
			t.equal(
				POPN_9B_IMPL.goalCriteriaFormatters.score(908_182),
				"Get a score of 908,182 on"
			);

			t.end();
		});

		t.test("Progress", (t) => {
			const f = (
				k: keyof typeof POPN_9B_IMPL.goalProgressFormatters,
				modifant: Partial<ScoreData<"popn:9B">>,
				goalValue: any,
				expected: any
			) =>
				t.equal(
					POPN_9B_IMPL.goalProgressFormatters[k](
						dmf(mockPB, {
							scoreData: modifant,
						}),
						goalValue
					),
					expected
				);

			f("grade", { grade: "AAA", score: 95_342 }, GRADES.indexOf("S"), "S-2.7K");
			f("score", { score: 98_123 }, 100_000, "98,123");
			f("lamp", { lamp: "CLEAR" }, LAMPS.indexOf("CLEAR"), "CLEAR");

			t.end();
		});

		t.test("Out Of", (t) => {
			t.equal(POPN_9B_IMPL.goalOutOfFormatters.score(901_003), "901,003");
			t.equal(POPN_9B_IMPL.goalOutOfFormatters.score(983_132), "983,132");

			t.end();
		});

		t.end();
	});

	t.test("PB Merging", (t) => {
		t.beforeEach(ResetDBState);

		t.test("Should join best clear medal", async (t) => {
			await db.scores.insert(mockScore);
			await db.scores.insert(
				dmf(mockScore, {
					scoreID: "bestClearMedal",
					scoreData: {
						clearMedal: "perfect",
						lamp: "PERFECT",
						enumIndexes: {
							lamp: LAMPS.indexOf("PERFECT"),
							clearMedal: CLEAR_MEDALS.indexOf("perfect"),
						},
					},
				})
			);

			t.hasStrict(await CreatePBDoc("popn:9B", 1, TestingPopnChart, logger), {
				composedFrom: [
					{ name: "Best Score" },
					{ name: "Best Clear", scoreID: "bestClearMedal" },
				],
				scoreData: {
					score: mockScore.scoreData.score,
					lamp: "PERFECT",
					clearMedal: "perfect",
				},
			});

			t.end();
		});

		t.end();
	});

	t.end();
});
