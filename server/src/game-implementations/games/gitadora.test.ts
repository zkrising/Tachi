import { GITADORA_DORA_IMPL, GITADORA_GITA_IMPL } from "./gitadora";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { CreatePBDoc } from "lib/score-import/framework/pb/create-pb-doc";
import { GITADORA_GRADES, GITADORA_LAMPS, GetGPTString } from "tachi-common";
import t from "tap";
import { dmf, mkMockPB, mkMockScore } from "test-utils/misc";
import ResetDBState from "test-utils/resets";
import { TestingGitadoraChart } from "test-utils/test-data";
import type {
	GPTStrings,
	ProvidedMetrics,
	ScoreData,
	PBScoreDocument,
	ScoreDocument,
} from "tachi-common";

const logger = CreateLogCtx(__filename);

const baseMetrics: ProvidedMetrics[GPTStrings["gitadora"]] = {
	lamp: "CLEAR",
	percent: 45,
};

const scoreData: ScoreData<GPTStrings["gitadora"]> = {
	lamp: "CLEAR",
	percent: 96,
	grade: "SS",
	enumIndexes: {
		grade: GITADORA_GRADES.SS,
		lamp: GITADORA_LAMPS.CLEAR,
	},
	judgements: {},
	optional: { enumIndexes: {} },
};

for (const [playtype, impl] of [
	["Dora", GITADORA_DORA_IMPL],
	["Gita", GITADORA_GITA_IMPL],
] as const) {
	const mockScore = mkMockScore("gitadora", playtype, TestingGitadoraChart, scoreData);
	const mockPB = mkMockPB("gitadora", playtype, TestingGitadoraChart, scoreData);

	t.test(`Gitadora ${playtype} Implementation`, (t) => {
		t.test("Grade Deriver", (t) => {
			const f = (percent: number, expected: any) =>
				t.equal(
					impl.derivers.grade(dmf(baseMetrics, { percent }), TestingGitadoraChart as any),
					expected,
					`A percent of ${percent}% should result in grade=${expected}.`
				);

			f(0, "C");
			f(62, "C");
			f(63, "B");
			f(73, "A");
			f(80, "S");
			f(94, "S");
			f(95, "SS");
			f(100, "MAX");

			// almosts
			f(62.99, "C");
			f(72.99, "B");
			f(79.99, "A");
			f(94.99, "S");
			f(99.99, "SS");

			t.end();
		});

		t.test("Skill Calc", (t) => {
			const f = (
				modifant: Partial<ScoreData<GPTStrings["gitadora"]>>,
				expected: any,
				msg: string
			) =>
				t.equal(
					impl.scoreCalcs.skill(dmf(scoreData, modifant), TestingGitadoraChart as any),
					expected,
					msg
				);

			f({ percent: 76.57 }, 72.74, "Basic Skill Check");

			t.end();
		});

		t.todo("Profile Calc");

		t.test("Colour Class", (t) => {
			const f = (v: number | null, expected: any) =>
				t.equal(
					impl.classDerivers.colour({ naiveSkill: v }),
					expected,
					`A skill level of ${v} should result in ${expected}.`
				);

			f(null, null);
			f(1, "WHITE");
			f(999, "WHITE");
			f(1000, "ORANGE");
			f(2000, "YELLOW");
			f(3000, "GREEN");
			f(4000, "BLUE");
			f(5000, "PURPLE");
			f(6000, "RED");

			f(1500, "ORANGE_GRD");
			f(2500, "YELLOW_GRD");
			f(3500, "GREEN_GRD");
			f(4500, "BLUE_GRD");
			f(5500, "PURPLE_GRD");
			f(6500, "RED_GRD");

			f(7000, "BRONZE");
			f(7500, "SILVER");
			f(8000, "GOLD");
			f(8500, "RAINBOW");

			t.end();
		});

		t.test("Goal Formatters", (t) => {
			t.test("Criteria", (t) => {
				t.equal(impl.goalCriteriaFormatters.percent(28.194), "Get 28.19% on");
				t.equal(impl.goalCriteriaFormatters.percent(28.195), "Get 28.20% on");

				t.end();
			});

			t.test("Progress", (t) => {
				const f = (
					k: keyof typeof impl.goalProgressFormatters,
					modifant: Partial<ScoreData<GPTStrings["gitadora"]>>,
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

				f("percent", { percent: 12.32 }, 30, "12.32%");

				f("grade", { grade: "SS", percent: 98.19 }, GITADORA_GRADES.MAX, "MAX-1.81%");

				f("lamp", { lamp: "CLEAR" }, GITADORA_LAMPS.CLEAR, "CLEAR");

				t.end();
			});

			t.test("Out Of", (t) => {
				t.equal(impl.goalOutOfFormatters.percent(28.194), "28.19%");
				t.equal(impl.goalOutOfFormatters.percent(28.194), "28.19%");

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
							enumIndexes: { lamp: GITADORA_LAMPS.FULL_COMBO },
						},
					})
				);

				t.hasStrict(
					await CreatePBDoc(
						GetGPTString("gitadora", playtype),
						1,
						TestingGitadoraChart as any,
						logger
					),
					{
						composedFrom: [
							{ name: "Best Percent" },
							{ name: "Best Lamp", scoreID: "bestLamp" },
						],
						scoreData: {
							percent: mockScore.scoreData.percent,
							lamp: "FULL COMBO",
							enumIndexes: { lamp: GITADORA_LAMPS.FULL_COMBO },
						},
					}
				);

				t.end();
			});

			t.end();
		});

		t.end();
	});
}
