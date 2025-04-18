/* eslint-disable no-bitwise */
import { ConverterAPICGJubeat } from "./converter";
import CreateLogCtx from "lib/logger/logger";
import { ParseDateFromString } from "lib/score-import/framework/common/score-utils";
import t from "tap";
import { dmf } from "test-utils/misc";
import type { CGContext, CGJubeatScore } from "../types";
import type { DryScore } from "lib/score-import/framework/common/types";

const logger = CreateLogCtx(__filename);

const BIT_FAILED = 1 << 0;
const BIT_CLEAR = 1 << 1;
const BIT_FULL_COMBO = 1 << 2;
const BIT_EXCELLENT = 1 << 3;

function mkInput(modifant: Partial<CGJubeatScore> = {}) {
	const validInput: CGJubeatScore = {
		internalId: 10000001,
		difficulty: 1, // ADV
		version: 9, // festo
		dateTime: "2019-06-06 08:14:22",
		score: 947_184,
		hardMode: false,
		perfectCount: 100,
		greatCount: 50,
		goodCount: 25,
		poorCount: 0,
		missCount: 0,
		musicRate: 952,
		clearFlag: BIT_FULL_COMBO | BIT_CLEAR | BIT_FAILED,
	};

	return dmf(validInput, modifant);
}

// we use any here because it's not easy to allow deep partials
function mkOutput(modifant: any = {}): DryScore<"jubeat:Single"> {
	const validOutput: DryScore<"jubeat:Single"> = {
		comment: null,
		game: "jubeat",
		importType: "api/cg-dev-jubeat",
		timeAchieved: ParseDateFromString("2019-06-06 08:14:22"),
		service: "CG Dev",
		scoreData: {
			score: 947_184,
			lamp: "FULL COMBO",
			judgements: {
				perfect: 100,
				great: 50,
				good: 25,
				poor: 0,
				miss: 0,
			},
			musicRate: 95.2,
			optional: {},
		},
		scoreMeta: {},
	};

	return dmf(validOutput, modifant);
}

t.test("#ConverterAPICGJubeat", (t) => {
	const context: CGContext = {
		service: "dev",
		userID: 1,
	};
	const convert = (modifant: Partial<CGJubeatScore> = {}) =>
		ConverterAPICGJubeat(mkInput(modifant), context, "api/cg-dev-jubeat", logger);

	t.test("Valid Input", async (t) => {
		const res = await convert();

		t.hasStrict(res, {
			song: {
				id: 1,
			},
			chart: {
				difficulty: "ADV",
				data: {
					inGameID: 10000001,
				},
			},
			dryScore: mkOutput(),
		});

		t.end();
	});

	t.test("Lamp Interpretation from Bitfield", (t) => {
		t.test("should interpret EXCELLENT bitfield correctly", async (t) => {
			const clearFlag = BIT_EXCELLENT | BIT_FULL_COMBO | BIT_CLEAR | BIT_FAILED;
			const score = 1_000_000;
			const judgements = {
				perfectCount: 200,
				greatCount: 0,
				goodCount: 0,
				poorCount: 0,
				missCount: 0,
			};

			t.hasStrict(
				await convert({
					clearFlag,
					score,
					...judgements,
				}),
				{
					dryScore: mkOutput({
						scoreData: {
							lamp: "EXCELLENT",
							score,
							judgements: {
								perfect: 200,
								great: 0,
								good: 0,
								poor: 0,
								miss: 0,
							},
						},
					}),
				}
			);
		});

		t.test("should interpret FULL COMBO bitfield correctly", async (t) => {
			const clearFlag = BIT_FULL_COMBO | BIT_CLEAR | BIT_FAILED;
			const judgements = {
				perfectCount: 100,
				greatCount: 50,
				goodCount: 25,
				poorCount: 0,
				missCount: 0,
			};
			const score = 947_184;

			t.hasStrict(
				await convert({
					clearFlag,
					score,
					...judgements,
				}),
				{
					dryScore: mkOutput({
						scoreData: {
							lamp: "FULL COMBO",
							score,
							judgements: {
								perfect: 100,
								great: 50,
								good: 25,
								poor: 0,
								miss: 0,
							},
						},
					}),
				}
			);
		});

		t.test("should interpret CLEAR bitfield correctly", async (t) => {
			const clearFlag = BIT_CLEAR | BIT_FAILED;
			const score = 750_000;
			const judgements = {
				perfectCount: 90,
				greatCount: 40,
				goodCount: 20,
				poorCount: 5,
				missCount: 1,
			};

			t.hasStrict(
				await convert({
					clearFlag,
					score,
					...judgements,
				}),
				{
					dryScore: mkOutput({
						scoreData: {
							lamp: "CLEAR",
							score,
							judgements: {
								perfect: 90,
								great: 40,
								good: 20,
								poor: 5,
								miss: 1,
							},
						},
					}),
				}
			);
		});

		t.test("should interpret FAILED bitfield correctly (standard)", async (t) => {
			const clearFlag = BIT_FAILED;
			const score = 650_000;
			const judgements = {
				perfectCount: 80,
				greatCount: 30,
				goodCount: 15,
				poorCount: 10,
				missCount: 5,
			};

			t.hasStrict(
				await convert({
					clearFlag,
					score,
					...judgements,
				}),
				{
					dryScore: mkOutput({
						scoreData: {
							lamp: "FAILED",
							score,
							judgements: {
								perfect: 80,
								great: 30,
								good: 15,
								poor: 10,
								miss: 5,
							},
						},
					}),
				}
			);
		});

		t.test("should interpret FAILED bitfield (case of challenge fail)", async (t) => {
			const clearFlag = BIT_FAILED;
			const score = 920_000;
			const judgements = {
				perfectCount: 110,
				greatCount: 55,
				goodCount: 30,
				poorCount: 0,
				missCount: 0,
			};

			t.hasStrict(
				await convert({
					clearFlag,
					score,
					...judgements,
				}),
				{
					dryScore: mkOutput({
						scoreData: {
							lamp: "FAILED",
							score,
							judgements: {
								perfect: 110,
								great: 55,
								good: 30,
								poor: 0,
								miss: 0,
							},
						},
					}),
				}
			);
		});

		t.end();
	});

	t.end();
});
