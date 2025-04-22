import { ONGEKI_IMPL } from "./ongeki";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { CreatePBDoc, UpdateChartRanking } from "lib/score-import/framework/pb/create-pb-doc";
import { ONGEKI_BELL_LAMPS, ONGEKI_GRADES, ONGEKI_NOTE_LAMPS } from "tachi-common";
import t from "tap";
import { dmf, mkMockPB, mkMockScore } from "test-utils/misc";
import ResetDBState from "test-utils/resets";
import { TestingOngekiChart, TestingOngekiScorePB } from "test-utils/test-data";
import type { PBScoreDocument, ProvidedMetrics, ScoreData } from "tachi-common";

const baseMetrics: ProvidedMetrics["ongeki:Single"] = {
	noteLamp: "CLEAR",
	bellLamp: "FULL BELL",
	score: 1_001_500,
};

const scoreData: ScoreData<"ongeki:Single"> = {
	noteLamp: "CLEAR",
	bellLamp: "FULL BELL",
	score: 1_001_500,
	grade: "SSS",
	judgements: {},
	optional: { enumIndexes: {}, bellCount: 100, platScore: 1000 },
	enumIndexes: {
		grade: ONGEKI_GRADES.SSS,
		noteLamp: ONGEKI_NOTE_LAMPS.CLEAR,
		bellLamp: ONGEKI_BELL_LAMPS.FULL_BELL,
	},
};

const mockScore = mkMockScore("ongeki", "Single", TestingOngekiChart, scoreData);
const mockPB = mkMockPB("ongeki", "Single", TestingOngekiChart, scoreData);

const logger = CreateLogCtx(__filename);

t.test("ONGEKI Implementation", (t) => {
	t.test("Grade Deriver", (t) => {
		const f = (score: number, expected: any) =>
			t.equal(
				ONGEKI_IMPL.derivers.grade(dmf(baseMetrics, { score }), TestingOngekiChart),
				expected,
				`A score of ${score.toLocaleString()} should result in grade=${expected}.`
			);

		f(0, "D");
		f(500_000, "C");
		f(700_000, "B");
		f(750_000, "BB");
		f(800_000, "BBB");
		f(850_000, "A");
		f(900_000, "AA");
		f(940_000, "AAA");
		f(970_000, "S");
		f(990_000, "SS");
		f(1_000_000, "SSS");
		f(1_007_500, "SSS+");
		f(1_010_000, "SSS+");

		t.end();
	});

	t.test("Rating Calc", (t) => {
		t.equal(
			ONGEKI_IMPL.scoreCalcs.rating(scoreData, TestingOngekiChart),
			12.1,
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
						...TestingOngekiScorePB,
						chartID: `TEST${idx}`,
						calculatedData: {
							...TestingOngekiScorePB.calculatedData,
							rating,
						},
					})
				)
			);
		};

		t.test("Floating-point edge case", async (t) => {
			await mockPBs(Array(45).fill(16.27));

			t.equal(await ONGEKI_IMPL.profileCalcs.naiveRating("ongeki", "Single", 1), 16.27);

			t.end();
		});

		t.test("Profile with fewer than 45 scores", async (t) => {
			await mockPBs([16, 16, 16, 16]);

			t.equal(await ONGEKI_IMPL.profileCalcs.naiveRating("ongeki", "Single", 1), 1.42);

			t.end();
		});

		t.end();
	});

	t.test("Colour Deriver", (t) => {
		const f = (v: number | null, expected: any) =>
			t.equal(
				ONGEKI_IMPL.classDerivers.colour({ naiveRating: v }),
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
		f(13, "SILVER");
		f(14, "GOLD");
		f(14.5, "PLATINUM");
		f(15, "RAINBOW");

		t.end();
	});

	t.test("Goal Formatters", (t) => {
		t.test("Criteria", (t) => {
			t.equal(
				ONGEKI_IMPL.goalCriteriaFormatters.score(1_008_182),
				"Get a score of 1,008,182 on"
			);

			t.end();
		});

		t.test("Progress", (t) => {
			const f = (
				k: keyof typeof ONGEKI_IMPL.goalProgressFormatters,
				modifant: Partial<ScoreData<"ongeki:Single">>,
				goalValue: any,
				expected: any
			) =>
				t.equal(
					ONGEKI_IMPL.goalProgressFormatters[k](
						dmf(mockPB, {
							scoreData: modifant,
						}),
						goalValue
					),
					expected
				);

			f("grade", { grade: "S", score: 987_342 }, ONGEKI_GRADES.S, "SS-2.7K");
			f("score", { score: 982_123 }, 1_000_000, "982,123");
			f("noteLamp", { noteLamp: "CLEAR" }, ONGEKI_NOTE_LAMPS.CLEAR, "CLEAR");

			t.end();
		});

		t.test("Out Of", (t) => {
			t.equal(ONGEKI_IMPL.goalOutOfFormatters.score(1_001_003), "1,001,003");
			t.equal(ONGEKI_IMPL.goalOutOfFormatters.score(983_132), "983,132");

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
						noteLamp: "FULL COMBO",
						enumIndexes: { noteLamp: ONGEKI_NOTE_LAMPS.FULL_COMBO },
					},
				})
			);

			t.hasStrict(await CreatePBDoc("ongeki:Single", 1, TestingOngekiChart, logger), {
				composedFrom: [
					{ name: "Best Score" },
					{ name: "Best Note Lamp", scoreID: "bestLamp" },
				],
				scoreData: {
					score: mockScore.scoreData.score,
					noteLamp: "FULL COMBO",
					bellLamp: "FULL BELL",
					enumIndexes: {
						noteLamp: ONGEKI_NOTE_LAMPS.FULL_COMBO,
						bellLamp: ONGEKI_BELL_LAMPS.FULL_BELL,
					},
				},
			});

			t.end();
		});

		t.end();
	});

	t.test("Ranking", (t) => {
		t.beforeEach(ResetDBState);

		t.test("Should tiebreak according to platinum score", async (t) => {
			await db["personal-bests"].insert({
				...TestingOngekiScorePB,
				scoreData: {
					...TestingOngekiScorePB.scoreData,
					optional: {
						platScore: 1000,
					},
				} as ScoreData<"ongeki:Single">,
				timeAchieved: 3,
				userID: 1,
			});

			await db["personal-bests"].insert({
				...TestingOngekiScorePB,
				scoreData: {
					...TestingOngekiScorePB.scoreData,
					optional: {
						platScore: 1001,
					},
				} as ScoreData<"ongeki:Single">,
				timeAchieved: 2,
				userID: 2,
			});

			await db["personal-bests"].insert({
				...TestingOngekiScorePB,
				scoreData: {
					...TestingOngekiScorePB.scoreData,
					optional: {
						platScore: 999,
					},
				} as ScoreData<"ongeki:Single">,
				timeAchieved: 1,
				userID: 3,
			});

			await UpdateChartRanking("ongeki", "Single", TestingOngekiChart.chartID);

			const pbs = (await db["personal-bests"].find({
				chartID: TestingOngekiChart.chartID,
			})) as Array<PBScoreDocument<"ongeki:Single">>;

			for (const pb of pbs) {
				t.strictSame(pb.rankingData.outOf, 3);
				if (pb.scoreData.optional.platScore === 999) {
					t.strictSame(pb.rankingData.rank, 3);
				} else if (pb.scoreData.optional.platScore === 1000) {
					t.strictSame(pb.rankingData.rank, 2);
				} else {
					t.strictSame(pb.rankingData.rank, 1);
				}
			}

			t.end();
		});

		t.end();
	});

	t.end();
});
