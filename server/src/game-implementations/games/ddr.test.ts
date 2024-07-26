import { DDR_IMPL } from "./ddr";
import { IIDX_DP_IMPL, IIDX_SP_IMPL } from "./iidx";
import { TestSnapshot } from "../../test-utils/single-process-snapshot";
import { DDR_GRADES, DDR_LAMPS } from "tachi-common";
import t from "tap";
import { dmf, mkFakePBDDRSP } from "test-utils/misc";
import { Testing511SPA, TestingDDRSP, TestingDDRSPScore } from "test-utils/test-data";
import type { ChartDocumentData, ProvidedMetrics, ScoreData } from "tachi-common";

const baseMetrics: ProvidedMetrics["ddr:DP" | "ddr:SP"] = {
	lamp: "CLEAR",
	score: 750_000,
};

t.test("DDR Implementation", (t) => {
	t.test("Derivers", (t) => {
		const impl = DDR_IMPL;

		t.test("Grade", (t) => {
			const f = (score: number, expected: any) =>
				t.equal(
					impl.derivers.grade(dmf(baseMetrics, { score }), TestingDDRSP as any),
					expected,
					`A score of ${score} should result in grade=${expected}.`
				);

			f(990500, "AAA");
			f(950500, "AA+");
			f(900500, "AA");
			f(890500, "AA-");
			f(850500, "A+");
			f(800500, "A");
			f(790500, "A-");
			f(750500, "B+");
			f(700500, "B");
			f(690500, "B-");
			f(650500, "C+");
			f(600500, "C");
			f(590500, "C-");
			f(550500, "D+");
			f(500, "D");

			t.end();
		});

		t.end();
	});
	t.test("Class Derivers", (t) => {
		const impl = DDR_IMPL;

		t.test("Flare", (t) => {
			const f = (ratings: number, expected: any) =>
				t.equal(
					impl.classDerivers.flare({ flareSkill: ratings }),
					expected,
					`A flare skill of ${ratings} should result in grade=${expected}.`
				);

			f(1, "NONE");
			f(501, "NONE+");
			f(1001, "NONE++");
			f(1501, "NONE+++");
			f(2001, "MERCURY");
			f(3001, "MERCURY+");
			f(4001, "MERCURY++");
			f(5001, "MERCURY+++");
			f(6001, "VENUS");
			f(7001, "VENUS+");
			f(8001, "VENUS++");
			f(9001, "VENUS+++");
			f(10001, "EARTH");
			f(11501, "EARTH+");
			f(13001, "EARTH++");
			f(14501, "EARTH+++");
			f(16001, "MARS");
			f(18001, "MARS+");
			f(20001, "MARS++");
			f(22001, "MARS+++");
			f(24001, "JUPITER");
			f(26501, "JUPITER+");
			f(29001, "JUPITER++");
			f(31501, "JUPITER+++");
			f(34001, "SATURN");
			f(36751, "SATURN+");
			f(39501, "SATURN++");
			f(42251, "SATURN+++");
			f(45001, "URANUS");
			f(48751, "URANUS+");
			f(52501, "URANUS++");
			f(56251, "URANUS+++");
			f(60001, "NEPTUNE");
			f(63751, "NEPTUNE+");
			f(67501, "NEPTUNE++");
			f(71251, "NEPTUNE+++");
			f(75001, "SUN");
			f(78751, "SUN+");
			f(82501, "SUN++");
			f(86251, "SUN+++");
			f(90001, "WORLD");

			t.end();
		});

		t.end();
	});

	t.test("CalculatedData", (t) => {
		const impl = DDR_IMPL;

		t.test("Flare Skill", (t) => {
			const f = (
				scoreData: Partial<ScoreData<"ddr:DP" | "ddr:SP">>,
				chartData: Partial<ChartDocumentData["ddr:DP" | "ddr:SP"]>,
				expected: any,
				msg: string
			) =>
				t.equal(
					impl.scoreCalcs.flareSkill(
						dmf(TestingDDRSPScore.scoreData, scoreData),
						dmf(TestingDDRSP, { data: chartData as any }) as any
					),
					expected,
					msg
				);

			f(
				{ grade: "AA", lamp: "CLEAR", optional: { flare: "II", enumIndexes: {} } },
				{},
				257,
				"Level 6 song with Flare II should give 257 flare skill"
			);

			f({ grade: "E", lamp: "FAILED" }, {}, 0, "Song failed: flare skill should be 0");

			t.end();
		});

		t.end();
	});

	t.test("Goal Formatters", (t) => {
		const impl = DDR_IMPL;

		t.test("Criteria", (t) => {
			t.equal(impl.goalCriteriaFormatters.score(123456), "Get a score of 123,456 on");
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
						mkFakePBDDRSP({
							// @ts-expect-error lol deepmerge types
							scoreData: modifant,
						}),
						goalValue
					),
					expected
				);

			f("score", { score: 123_456 }, 1_000_000, "123,456");
			f("score", { score: 0 }, 1_000_000, "0");

			f("grade", { score: 955000, grade: "AA+" }, DDR_GRADES.AAA, "AAA-35,000");
			f("grade", { score: 995000, grade: "AAA" }, DDR_GRADES.AAA, "AAA+5,000");

			f("lamp", { lamp: "CLEAR", optional: {} as any }, DDR_LAMPS.FULL_COMBO, "CLEAR");

			f(
				"lamp",
				{ lamp: "FULL COMBO", optional: {} as any },
				DDR_LAMPS.FULL_COMBO,
				"FULL COMBO"
			);

			t.end();
		});

		t.test("OutOf", (t) => {
			t.equal(impl.goalOutOfFormatters.score(123456), "123,456");

			t.end();
		});

		t.end();
	});

	t.end();
});
