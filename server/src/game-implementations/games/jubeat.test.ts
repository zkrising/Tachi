import { JUBEAT_IMPL } from "./jubeat";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { CreatePBDoc } from "lib/score-import/framework/pb/create-pb-doc";
import { JUBEAT_SINGLE_CONF } from "tachi-common/config/game-support/jubeat";
import t from "tap";
import { dmf, mkMockPB, mkMockScore } from "test-utils/misc";
import ResetDBState from "test-utils/resets";
import { TestSnapshot } from "test-utils/single-process-snapshot";
import { TestingJubeatChart } from "test-utils/test-data";
import type { ProvidedMetrics, ScoreData } from "tachi-common";

const logger = CreateLogCtx(__filename);

const baseMetrics: ProvidedMetrics["jubeat:Single"] = {
	lamp: "CLEAR",
	musicRate: 84.21,
	score: 970_000,
};

const GRADES = JUBEAT_SINGLE_CONF.derivedMetrics.grade.values;
const LAMPS = JUBEAT_SINGLE_CONF.providedMetrics.lamp.values;

const scoreData: ScoreData<"jubeat:Single"> = {
	lamp: "CLEAR",
	musicRate: 84.21,
	score: 970_000,
	grade: "SS",
	judgements: {},
	optional: { enumIndexes: {} },
	enumIndexes: {
		grade: GRADES.indexOf("SS"),
		lamp: LAMPS.indexOf("CLEAR"),
	},
};

const mockScore = mkMockScore("jubeat", "Single", TestingJubeatChart, scoreData);
const mockPB = mkMockPB("jubeat", "Single", TestingJubeatChart, scoreData);

t.test("Jubeat Implementation", (t) => {
	t.test("Grade Deriver", (t) => {
		const f = (score: number, expected: any) =>
			t.equal(
				JUBEAT_IMPL.derivers.grade(dmf(baseMetrics, { score }), TestingJubeatChart),
				expected,
				`A score of ${score.toLocaleString()} should result in grade=${expected}.`
			);

		f(0, "E");
		f(500_000, "D");
		f(700_000, "C");
		f(800_000, "B");
		f(850_000, "A");
		f(900_000, "S");
		f(950_000, "SS");
		f(980_000, "SSS");
		f(1_000_000, "EXC");

		t.end();
	});

	t.test("Music Rate Validator", (t) => {
		t.equal(
			JUBEAT_IMPL.validators.musicRate(80, TestingJubeatChart),
			true,
			"normal music rate"
		);
		t.equal(JUBEAT_IMPL.validators.musicRate(0, TestingJubeatChart), true, "0 music rate");
		t.equal(
			JUBEAT_IMPL.validators.musicRate(100, TestingJubeatChart),
			true,
			"perfect music rate"
		);
		t.equal(
			JUBEAT_IMPL.validators.musicRate(
				120,
				dmf(TestingJubeatChart, {
					difficulty: "HARD ADV",
				})
			),
			true,
			"perfect music rate (hard)"
		);

		TestSnapshot(
			t,
			JUBEAT_IMPL.validators.musicRate(-1, TestingJubeatChart),
			`Jubeat Music Rate Validator: negative`
		);
		TestSnapshot(
			t,
			JUBEAT_IMPL.validators.musicRate(
				100.1,
				dmf(TestingJubeatChart, {
					difficulty: "ADV",
				})
			),
			`Jubeat Music Rate Validator: too big`
		);
		TestSnapshot(
			t,
			JUBEAT_IMPL.validators.musicRate(
				120.1,
				dmf(TestingJubeatChart, {
					difficulty: "HARD ADV",
				})
			),
			`Jubeat Music Rate Validator: too big (hard)`
		);
		t.end();
	});

	t.test("Jubility Calc", (t) => {
		t.equal(
			JUBEAT_IMPL.scoreCalcs.jubility(scoreData, TestingJubeatChart),
			63.7,
			"Basic Jubility Test"
		);

		t.end();
	});

	t.todo("Session Calcs");
	t.todo("Profile Calcs");

	t.test("Colour Deriver", (t) => {
		const f = (v: number | null, expected: any) =>
			t.equal(
				JUBEAT_IMPL.classDerivers.colour({ jubility: v }),
				expected,
				`A jubility of ${v} should result in ${expected}.`
			);

		f(null, null);
		f(0, "BLACK");

		f(9500, "GOLD");
		f(8500, "ORANGE");
		f(7000, "PINK");
		f(5500, "PURPLE");
		f(4000, "VIOLET");
		f(2500, "BLUE");
		f(1500, "LIGHT_BLUE");
		f(750, "GREEN");
		f(250, "YELLOW_GREEN");

		t.end();
	});

	t.test("Goal Formatters", (t) => {
		t.test("Criteria", (t) => {
			t.equal(
				JUBEAT_IMPL.goalCriteriaFormatters.score(1_008_182),
				"Get a score of 1,008,182 on"
			);
			t.equal(
				JUBEAT_IMPL.goalCriteriaFormatters.musicRate(93.1),
				"Get a music rate of 93.1% on"
			);

			t.end();
		});

		t.test("Progress", (t) => {
			const f = (
				k: keyof typeof JUBEAT_IMPL.goalProgressFormatters,
				modifant: Partial<ScoreData<"jubeat:Single">>,
				goalValue: any,
				expected: any
			) =>
				t.equal(
					JUBEAT_IMPL.goalProgressFormatters[k](
						dmf(mockPB, {
							scoreData: modifant,
						}),
						goalValue
					),
					expected
				);

			f("grade", { grade: "S", score: 927_342 }, GRADES.indexOf("S"), "SS-23K");
			f("score", { score: 982_123 }, 1_000_000, "982,123");
			f("lamp", { lamp: "CLEAR" }, LAMPS.indexOf("CLEAR"), "CLEAR");
			f("musicRate", { musicRate: 93.2 }, 94.4, "93.2%");

			t.end();
		});

		t.test("Out Of", (t) => {
			t.equal(JUBEAT_IMPL.goalOutOfFormatters.score(983_132), "983,132");
			t.equal(JUBEAT_IMPL.goalOutOfFormatters.musicRate(99.1123), "99.1%");

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
						musicRate: 0,
						score: 0,
						lamp: "FULL COMBO",
						enumIndexes: { lamp: LAMPS.indexOf("FULL COMBO") },
					},
				})
			);

			t.hasStrict(await CreatePBDoc("jubeat:Single", 1, TestingJubeatChart, logger), {
				composedFrom: [
					{ name: "Best Music Rate" },
					{ name: "Best Lamp", scoreID: "bestLamp" },
				],
				scoreData: {
					musicRate: mockScore.scoreData.musicRate,
					score: mockScore.scoreData.score,
					lamp: "FULL COMBO",
					enumIndexes: { lamp: LAMPS.indexOf("FULL COMBO") },
				},
			});

			t.end();
		});

		t.test("Should join best score", async (t) => {
			await db.scores.insert(mockScore);
			await db.scores.insert(
				dmf(mockScore, {
					scoreID: "bestScore",
					scoreData: {
						musicRate: 0,
						score: 1_000_000,
						lamp: "FAILED",
						enumIndexes: { lamp: LAMPS.indexOf("FAILED") },
					},
				})
			);

			t.hasStrict(await CreatePBDoc("jubeat:Single", 1, TestingJubeatChart, logger), {
				composedFrom: [
					{ name: "Best Music Rate" },
					{ name: "Best Score", scoreID: "bestScore" },
				],
				scoreData: {
					musicRate: mockScore.scoreData.musicRate,
					lamp: mockScore.scoreData.lamp,
					score: 1_000_000,
				},
			});

			t.end();
		});

		t.end();
	});

	t.end();
});
