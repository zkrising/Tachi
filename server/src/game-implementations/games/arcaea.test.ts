import { RunValidators } from "./_common";
import { ARCAEA_IMPL } from "./arcaea";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { CreatePBDoc } from "lib/score-import/framework/pb/create-pb-doc";
import { ARCAEA_GRADES, ARCAEA_LAMPS } from "tachi-common";
import t from "tap";
import { dmf, mkMockPB, mkMockScore } from "test-utils/misc";
import ResetDBState from "test-utils/resets";
import { TestSnapshot } from "test-utils/single-process-snapshot";
import { TestingArcaeaSheriruthFTR } from "test-utils/test-data";
import type { ProvidedMetrics, ScoreData, ScoreDocument } from "tachi-common";
import type { DeepPartial } from "utils/types";

const baseMetrics: ProvidedMetrics["arcaea:Touch"] = {
	lamp: "CLEAR",
	score: 9_979_366,
};

const scoreData: ScoreData<"arcaea:Touch"> = {
	lamp: "CLEAR",
	score: 9_979_366,
	grade: "EX+",
	judgements: {
		pure: 1148,
		far: 1,
		lost: 2,
	},
	optional: { enumIndexes: {} },
	enumIndexes: {
		grade: ARCAEA_GRADES.EX_PLUS,
		lamp: ARCAEA_LAMPS.CLEAR,
	},
};

const mockScore = mkMockScore("arcaea", "Touch", TestingArcaeaSheriruthFTR, scoreData);
const mockPB = mkMockPB("arcaea", "Touch", TestingArcaeaSheriruthFTR, scoreData);

const logger = CreateLogCtx(__filename);

t.test("Arcaea Implementation", (t) => {
	t.test("Grade Deriver", (t) => {
		const f = (score: number, expected: string) =>
			t.equal(
				ARCAEA_IMPL.derivers.grade(dmf(baseMetrics, { score }), TestingArcaeaSheriruthFTR),
				expected,
				`A score of ${score.toLocaleString()} should result in grade=${expected}.`
			);

		f(0, "D");
		f(8_600_000, "C");
		f(8_900_000, "B");
		f(9_200_000, "A");
		f(9_500_000, "AA");
		f(9_800_000, "EX");
		f(9_900_000, "EX+");

		t.end();
	});

	t.test("Rating Calc", (t) => {
		t.equal(
			ARCAEA_IMPL.scoreCalcs.potential(scoreData, TestingArcaeaSheriruthFTR),
			11.99,
			"Basic potential check"
		);

		t.end();
	});

	t.todo("Session Calcs");
	t.todo("Profile Calcs");

	t.test("Colour Deriver", (t) => {
		const f = (v: number | null, expected: any) =>
			t.equal(
				ARCAEA_IMPL.classDerivers.badge({ naivePotential: v }),
				expected,
				`A naivePotential of ${v} should result in ${expected}.`
			);

		f(null, null);
		f(0, "BLUE");
		f(3.5, "GREEN");
		f(7, "ASH_PURPLE");
		f(10, "PURPLE");
		f(11, "RED");
		f(12, "ONE_STAR");
		f(12.5, "TWO_STARS");
		f(13, "THREE_STARS");

		t.end();
	});

	t.test("Goal Formatters", (t) => {
		t.test("Criteria", (t) => {
			t.equal(
				ARCAEA_IMPL.goalCriteriaFormatters.score(10_002_221),
				"Get a score of 10,002,221 on"
			);

			t.end();
		});

		t.test("Progress", (t) => {
			const f = (
				k: keyof typeof ARCAEA_IMPL.goalProgressFormatters,
				modifant: Partial<ScoreData<"arcaea:Touch">>,
				goalValue: any,
				expected: any
			) =>
				t.equal(
					ARCAEA_IMPL.goalProgressFormatters[k](
						dmf(mockPB, {
							scoreData: modifant,
						}),
						goalValue
					),
					expected
				);

			f("grade", { grade: "EX", score: 9_897_342 }, ARCAEA_GRADES.EX_PLUS, "(EX+)-2.7K");
			f("score", { score: 9_982_123 }, 10_000_000, "9,982,123");
			f("lamp", { lamp: "CLEAR" }, ARCAEA_LAMPS.CLEAR, "CLEAR");

			t.end();
		});

		t.test("Out Of", (t) => {
			t.equal(ARCAEA_IMPL.goalOutOfFormatters.score(10_001_003), "10,001,003");
			t.equal(ARCAEA_IMPL.goalOutOfFormatters.score(9_983_132), "9,983,132");

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
						lamp: "FULL RECALL",
						enumIndexes: { lamp: ARCAEA_LAMPS.FULL_RECALL },
					},
				})
			);

			t.hasStrict(await CreatePBDoc("arcaea:Touch", 1, TestingArcaeaSheriruthFTR, logger), {
				composedFrom: [{ name: "Best Score" }, { name: "Best Lamp", scoreID: "bestLamp" }],
				scoreData: {
					score: mockScore.scoreData.score,
					lamp: "FULL RECALL",
					enumIndexes: { lamp: ARCAEA_LAMPS.FULL_RECALL },
				},
			});

			t.end();
		});

		t.end();
	});

	t.test("Score Validations", (t) => {
		const f = (s: DeepPartial<ScoreDocument<"arcaea:Touch">>) =>
			RunValidators(ARCAEA_IMPL.scoreValidators, dmf(mockScore, s));

		t.strictSame(
			f({
				scoreData: {
					lamp: "PURE MEMORY",
					score: 10_001_151,
					judgements: {
						pure: 1151,
						far: 0,
						lost: 0,
					},
				},
			}),
			undefined
		);
		t.strictSame(f({ scoreData: { lamp: "FULL RECALL", judgements: { lost: 0 } } }), undefined);
		t.strictSame(
			ARCAEA_IMPL.chartSpecificValidators.score(
				mockScore.scoreData.score,
				TestingArcaeaSheriruthFTR
			),
			true
		);

		TestSnapshot(
			t,
			f({ scoreData: { lamp: "PURE MEMORY", score: 9_999_999 } }),
			"Arcaea IMPL Validators: Should disallow PURE MEMORY with non-perfect score"
		);

		TestSnapshot(
			t,
			f({ scoreData: { lamp: "FULL RECALL", score: 4_999_999 } }),
			"Arcaea IMPL Validators: Should disallow FULL RECALL scores smaller than the minimum possible score"
		);

		TestSnapshot(
			t,
			f({ scoreData: { lamp: "FULL RECALL", judgements: { lost: 1 } } }),
			`Arcaea IMPL Validators: Should disallow FR with lost`
		);
		TestSnapshot(
			t,
			f({ scoreData: { lamp: "PURE MEMORY", judgements: { far: 1 } } }),
			"Arcaea IMPL Validators: Should disallow PURE MEMORY with non-perfect Far judgements."
		);
		TestSnapshot(
			t,
			f({ scoreData: { lamp: "PURE MEMORY", judgements: { lost: 1 } } }),
			"Arcaea IMPL Validators: Should disallow PURE MEMORY with non-perfect Lost judgements."
		);

		TestSnapshot(
			t,
			ARCAEA_IMPL.chartSpecificValidators.score(-1, TestingArcaeaSheriruthFTR),
			"Arcaea IMPL Validators: Should disallow negative scores."
		);
		TestSnapshot(
			t,
			ARCAEA_IMPL.chartSpecificValidators.score(10_001_152, TestingArcaeaSheriruthFTR),
			"Arcaea IMPL Validators: Should disallow scores that exceed 10 million + notecount."
		);

		t.end();
	});

	t.end();
});
