import { CHUNITHM_IMPL } from "./chunithm";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { CreatePBDoc } from "lib/score-import/framework/pb/create-pb-doc";
import { CHUNITHM_GRADES, CHUNITHM_COMBO_LAMPS, CHUNITHM_CLEAR_LAMPS } from "tachi-common";
import t from "tap";
import { dmf, mkMockPB, mkMockScore } from "test-utils/misc";
import ResetDBState from "test-utils/resets";
import { CHUNITHMBBKKChart, TestingChunithmScorePB } from "test-utils/test-data";
import type { ProvidedMetrics, ScoreData } from "tachi-common";

const baseMetrics: ProvidedMetrics["chunithm:Single"] = {
	clearLamp: "CLEAR",
	comboLamp: "NONE",
	score: 1_003_000,
};

const scoreData: ScoreData<"chunithm:Single"> = {
	clearLamp: "CLEAR",
	comboLamp: "NONE",
	score: 1_003_000,
	grade: "SS",
	judgements: {},
	optional: { enumIndexes: {} },
	enumIndexes: {
		grade: CHUNITHM_GRADES.SS,
		clearLamp: CHUNITHM_CLEAR_LAMPS.CLEAR,
		comboLamp: CHUNITHM_COMBO_LAMPS.NONE,
	},
};

const mockScore = mkMockScore("chunithm", "Single", CHUNITHMBBKKChart, scoreData);
const mockPB = mkMockPB("chunithm", "Single", CHUNITHMBBKKChart, scoreData);

const logger = CreateLogCtx(__filename);

t.test("CHUNITHM Implementation", (t) => {
	t.test("Grade Deriver", (t) => {
		const f = (score: number, expected: any) =>
			t.equal(
				CHUNITHM_IMPL.derivers.grade(dmf(baseMetrics, { score }), CHUNITHMBBKKChart),
				expected,
				`A score of ${score.toLocaleString()} should result in grade=${expected}.`
			);

		f(0, "D");
		f(500_000, "C");
		f(600_000, "B");
		f(700_000, "BB");
		f(800_000, "BBB");
		f(900_000, "A");
		f(925_000, "AA");
		f(950_000, "AAA");
		f(975_000, "S");
		f(990_000, "S+");
		f(1_000_000, "SS");
		f(1_005_000, "SS+");
		f(1_007_500, "SSS");
		f(1_009_000, "SSS+");

		t.end();
	});

	t.test("Rating Calc", (t) => {
		t.equal(
			CHUNITHM_IMPL.scoreCalcs.rating(scoreData, CHUNITHMBBKKChart),
			4.3,
			"Basic rating check"
		);

		t.end();
	});

	t.todo("Session Calcs");

	t.test("Profile Calcs", (t) => {
		t.beforeEach(ResetDBState);

		const mockPBs = async (ratings: Array<number>) => {
			await Promise.all(
				ratings.map((rating, idx) =>
					db["personal-bests"].insert({
						...TestingChunithmScorePB,
						chartID: `TEST${idx}`,
						calculatedData: {
							...TestingChunithmScorePB.calculatedData,
							rating,
						},
					})
				)
			);
		};

		t.test("Floating-point edge case", async (t) => {
			await mockPBs(Array(50).fill(17.15));

			t.equal(await CHUNITHM_IMPL.profileCalcs.naiveRating("chunithm", "Single", 1), 17.15);

			t.end();
		});

		t.test("Profile with fewer than 50 scores", async (t) => {
			await mockPBs([16, 16, 16, 16]);

			t.equal(await CHUNITHM_IMPL.profileCalcs.naiveRating("chunithm", "Single", 1), 1.28);

			t.end();
		});

		t.end();
	});

	t.test("Colour Deriver", (t) => {
		const f = (v: number | null, expected: any) =>
			t.equal(
				CHUNITHM_IMPL.classDerivers.colour({ naiveRating: v }),
				expected,
				`A naiveRating of ${v} should result in ${expected}.`
			);

		f(null, null);
		f(0, "BLUE");
		f(2, "GREEN");
		f(4, "ORANGE");
		f(7, "RED");
		f(10, "PURPLE");
		f(12, "COPPER");
		f(13.25, "SILVER");
		f(14.5, "GOLD");
		f(15.25, "PLATINUM");
		f(16, "RAINBOW");
		f(16.25, "RAINBOW_II");
		f(16.5, "RAINBOW_III");
		f(16.75, "RAINBOW_IV");
		f(17, "RAINBOW_EX_I");
		f(17.25, "RAINBOW_EX_II");
		f(17.5, "RAINBOW_EX_III");

		t.end();
	});

	t.test("Goal Formatters", (t) => {
		t.test("Criteria", (t) => {
			t.equal(
				CHUNITHM_IMPL.goalCriteriaFormatters.score(1_008_182),
				"Get a score of 1,008,182 on"
			);

			t.end();
		});

		t.test("Progress", (t) => {
			const f = (
				k: keyof typeof CHUNITHM_IMPL.goalProgressFormatters,
				modifant: Partial<ScoreData<"chunithm:Single">>,
				goalValue: any,
				expected: any
			) =>
				t.equal(
					CHUNITHM_IMPL.goalProgressFormatters[k](
						dmf(mockPB, {
							scoreData: modifant,
						}),
						goalValue
					),
					expected
				);

			f("grade", { grade: "S+", score: 997_342 }, CHUNITHM_GRADES.SS, "SS-2.7K");
			f("score", { score: 982_123 }, 1_000_000, "982,123");
			f("clearLamp", { clearLamp: "CLEAR" }, CHUNITHM_CLEAR_LAMPS.CLEAR, "CLEAR");
			f(
				"comboLamp",
				{ comboLamp: "FULL COMBO" },
				CHUNITHM_COMBO_LAMPS.FULL_COMBO,
				"FULL COMBO"
			);

			t.end();
		});

		t.test("Out Of", (t) => {
			t.equal(CHUNITHM_IMPL.goalOutOfFormatters.score(1_001_003), "1,001,003");
			t.equal(CHUNITHM_IMPL.goalOutOfFormatters.score(983_132), "983,132");

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
						comboLamp: "FULL COMBO",
						enumIndexes: { comboLamp: CHUNITHM_COMBO_LAMPS.FULL_COMBO },
					},
				})
			);

			t.hasStrict(await CreatePBDoc("chunithm:Single", 1, CHUNITHMBBKKChart, logger), {
				composedFrom: [{ name: "Best Score" }, { name: "Best Lamp", scoreID: "bestLamp" }],
				scoreData: {
					score: mockScore.scoreData.score,
					comboLamp: "FULL COMBO",
					enumIndexes: { comboLamp: CHUNITHM_COMBO_LAMPS.FULL_COMBO },
				},
			});

			t.end();
		});

		t.end();
	});

	t.end();
});
