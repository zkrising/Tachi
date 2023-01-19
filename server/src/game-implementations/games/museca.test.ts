import { MUSECA_IMPL } from "./museca";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { CreatePBDoc } from "lib/score-import/framework/pb/create-pb-doc";
import { MUSECA_GRADES, MUSECA_LAMPS } from "tachi-common";
import t from "tap";
import { dmf, mkMockPB, mkMockScore } from "test-utils/misc";
import ResetDBState from "test-utils/resets";
import { TestingMusecaChart } from "test-utils/test-data";
import type { ProvidedMetrics, ScoreData } from "tachi-common";

const baseMetrics: ProvidedMetrics["museca:Single"] = {
	lamp: "CLEAR",
	score: 903_000,
};

const scoreData: ScoreData<"museca:Single"> = {
	lamp: "CLEAR",
	score: 970_000,
	grade: "傑",
	judgements: {},
	optional: { enumIndexes: {} },
	enumIndexes: {
		grade: MUSECA_GRADES.傑,
		lamp: MUSECA_LAMPS.CLEAR,
	},
};

const mockScore = mkMockScore("museca", "Single", TestingMusecaChart, scoreData);
const mockPB = mkMockPB("museca", "Single", TestingMusecaChart, scoreData);

const logger = CreateLogCtx(__filename);

t.test("MUSECA Implementation", (t) => {
	t.test("Grade Deriver", (t) => {
		const f = (score: number, expected: any) =>
			t.equal(
				MUSECA_IMPL.derivers.grade(dmf(baseMetrics, { score }), TestingMusecaChart),
				expected,
				`A score of ${score.toLocaleString()} should result in grade=${expected}.`
			);

		f(0, "没");
		f(600_000, "拙");
		f(700_000, "凡");
		f(800_000, "佳");
		f(850_000, "良");
		f(900_000, "優");
		f(950_000, "秀");
		f(975_000, "傑");
		f(1_000_000, "傑G");

		t.end();
	});

	t.todo("Score Calcs");
	t.todo("Session Calcs");
	t.todo("Profile Calcs");

	t.test("Goal Formatters", (t) => {
		t.test("Criteria", (t) => {
			t.equal(MUSECA_IMPL.goalCriteriaFormatters.score(908_182), "Get a score of 908,182 on");

			t.end();
		});

		t.test("Progress", (t) => {
			const f = (
				k: keyof typeof MUSECA_IMPL.goalProgressFormatters,
				modifant: Partial<ScoreData<"museca:Single">>,
				goalValue: any,
				expected: any
			) =>
				t.equal(
					MUSECA_IMPL.goalProgressFormatters[k](
						dmf(mockPB, {
							scoreData: modifant,
						}),
						goalValue
					),
					expected
				);

			f("grade", { grade: "傑", score: 997_342 }, MUSECA_GRADES.傑, "傑G-2.7K");
			f("score", { score: 982_123 }, 1_000_000, "982,123");
			f("lamp", { lamp: "CLEAR" }, MUSECA_LAMPS.CLEAR, "CLEAR");

			t.end();
		});

		t.test("Out Of", (t) => {
			t.equal(MUSECA_IMPL.goalOutOfFormatters.score(901_003), "901,003");
			t.equal(MUSECA_IMPL.goalOutOfFormatters.score(983_132), "983,132");

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
						lamp: "CONNECT ALL",
						enumIndexes: { lamp: MUSECA_LAMPS.CONNECT_ALL },
					},
				})
			);

			t.hasStrict(await CreatePBDoc("museca:Single", 1, TestingMusecaChart, logger), {
				composedFrom: [{ name: "Best Score" }, { name: "Best Lamp", scoreID: "bestLamp" }],
				scoreData: {
					score: mockScore.scoreData.score,
					lamp: "CONNECT ALL",
					enumIndexes: { lamp: MUSECA_LAMPS.CONNECT_ALL },
				},
			});

			t.end();
		});

		t.end();
	});

	t.end();
});
