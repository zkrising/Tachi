import { RunValidators } from "./_common";
import { WACCA_IMPL } from "./wacca";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { CreatePBDoc } from "lib/score-import/framework/pb/create-pb-doc";
import { WACCA_SINGLE_CONF } from "tachi-common/config/game-support/wacca";
import t from "tap";
import { dmf, mkMockPB, mkMockScore } from "test-utils/misc";
import ResetDBState from "test-utils/resets";
import { TestSnapshot } from "test-utils/single-process-snapshot";
import { TestingWaccaPupaExp } from "test-utils/test-data";
import type { ProvidedMetrics, ScoreData, ScoreDocument } from "tachi-common";
import type { DeepPartial } from "utils/types";

const GRADES = WACCA_SINGLE_CONF.derivedMetrics.grade.values;
const LAMPS = WACCA_SINGLE_CONF.providedMetrics.lamp.values;

const baseMetrics: ProvidedMetrics["wacca:Single"] = {
	lamp: "CLEAR",
	score: 953_000,
};

const scoreData: ScoreData<"wacca:Single"> = {
	lamp: "CLEAR",
	score: 953_000,
	grade: "SS",
	judgements: {},
	optional: { enumIndexes: {} },
	enumIndexes: {
		grade: GRADES.indexOf("SS"),
		lamp: LAMPS.indexOf("CLEAR"),
	},
};

const mockScore = mkMockScore("wacca", "Single", TestingWaccaPupaExp, scoreData);
const mockPB = mkMockPB("wacca", "Single", TestingWaccaPupaExp, scoreData);

const logger = CreateLogCtx(__filename);

t.test("WACCA Implementation", (t) => {
	t.test("Grade Deriver", (t) => {
		const f = (score: number, expected: any) =>
			t.equal(
				WACCA_IMPL.derivers.grade(dmf(baseMetrics, { score }), TestingWaccaPupaExp),
				expected,
				`A score of ${score.toLocaleString()} should result in grade=${expected}.`
			);

		f(0, "D");
		f(1, "C"); // LOL
		f(300_100, "B");
		f(700_000, "A");
		f(800_000, "AA");
		f(850_000, "AAA");
		f(900_000, "S");
		f(930_000, "S+");
		f(950_000, "SS");
		f(970_000, "SS+");
		f(980_000, "SSS");
		f(990_000, "SSS+");
		f(1_000_000, "MASTER");

		t.end();
	});

	t.test("Rating Calc", (t) => {
		t.equal(
			WACCA_IMPL.scoreCalcs.rate(scoreData, TestingWaccaPupaExp),
			41.1,
			"Basic rating check"
		);

		t.end();
	});

	t.todo("Session Calcs");
	t.todo("Profile Calcs");

	t.test("Colour Deriver", (t) => {
		const f = (v: number | null, expected: any) =>
			t.equal(
				WACCA_IMPL.classDerivers.colour({ naiveRate: v }),
				expected,
				`A rating of ${v} should result in ${expected}.`
			);

		f(null, null);
		f(0, "ASH");

		f(2500, "RAINBOW");
		f(2200, "GOLD");
		f(1900, "SILVER");
		f(1600, "BLUE");
		f(1300, "PURPLE");
		f(1000, "RED");
		f(600, "YELLOW");
		f(300, "NAVY");

		t.end();
	});

	t.test("Goal Formatters", (t) => {
		t.test("Criteria", (t) => {
			t.equal(WACCA_IMPL.goalCriteriaFormatters.score(908_182), "Get a score of 908,182 on");

			t.end();
		});

		t.test("Progress", (t) => {
			const f = (
				k: keyof typeof WACCA_IMPL.goalProgressFormatters,
				modifant: Partial<ScoreData<"wacca:Single">>,
				goalValue: any,
				expected: any
			) =>
				t.equal(
					WACCA_IMPL.goalProgressFormatters[k](
						dmf(mockPB, {
							scoreData: modifant,
						}),
						goalValue
					),
					expected
				);

			f("grade", { grade: "S", score: 917_342 }, GRADES.indexOf("SS"), "(S+)-13K");
			f("score", { score: 982_123 }, 1_000_000, "982,123");
			f("lamp", { lamp: "CLEAR" }, LAMPS.indexOf("CLEAR"), "CLEAR");

			t.end();
		});

		t.test("Out Of", (t) => {
			t.equal(WACCA_IMPL.goalOutOfFormatters.score(901_003), "901,003");
			t.equal(WACCA_IMPL.goalOutOfFormatters.score(983_132), "983,132");

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
						score: 0,
						lamp: "FULL COMBO",
						enumIndexes: { lamp: LAMPS.indexOf("FULL COMBO") },
					},
				})
			);

			t.hasStrict(await CreatePBDoc("wacca:Single", 1, TestingWaccaPupaExp, logger), {
				composedFrom: [{ name: "Best Score" }, { name: "Best Lamp", scoreID: "bestLamp" }],
				scoreData: {
					score: mockScore.scoreData.score,
					lamp: "FULL COMBO",
				},
			});

			t.end();
		});

		t.end();
	});

	t.test("Score Validations", (t) => {
		const f = (s: DeepPartial<ScoreDocument<"wacca:Single">>) =>
			RunValidators(WACCA_IMPL.scoreValidators, dmf(mockScore, s), TestingWaccaPupaExp);

		t.strictSame(f({ scoreData: { lamp: "ALL MARVELOUS", score: 1_000_000 } }), undefined);
		t.strictSame(f({ scoreData: { lamp: "FULL COMBO", judgements: { miss: 0 } } }), undefined);

		TestSnapshot(
			t,
			f({ scoreData: { lamp: "ALL MARVELOUS", score: 999_999 } }),
			"WACCA IMPL Validators: Should disallow ALL MARVELOUS with non-perfect score."
		);
		TestSnapshot(
			t,
			f({ scoreData: { lamp: "FULL COMBO", judgements: { miss: 1 } } }),
			`WACCA IMPL Validators: Should disallow FC with miss`
		);

		TestSnapshot(
			t,
			f({ scoreData: { lamp: "ALL MARVELOUS", judgements: { good: 1 } } }),
			"WACCA IMPL Validators: Should disallow ALL MARVELOUS with non-perfect good judgements."
		);
		TestSnapshot(
			t,
			f({ scoreData: { lamp: "ALL MARVELOUS", judgements: { great: 1 } } }),
			"WACCA IMPL Validators: Should disallow ALL MARVELOUS with non-perfect good judgements."
		);
		TestSnapshot(
			t,
			f({ scoreData: { lamp: "ALL MARVELOUS", judgements: { miss: 1 } } }),
			"WACCA IMPL Validators: Should disallow ALL MARVELOUS with non-perfect good judgements."
		);

		t.end();
	});

	t.end();
});
