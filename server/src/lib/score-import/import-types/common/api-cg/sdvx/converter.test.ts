import { ConverterAPICGSDVX } from "./converter";
import CreateLogCtx from "lib/logger/logger";
import t from "tap";
import { dmf } from "test-utils/misc";
import type { CGContext, CGSDVXScore } from "../types";
import type { DryScore } from "lib/score-import/framework/common/types";

const logger = CreateLogCtx(__filename);

function mkInput(modifant: Partial<CGSDVXScore> = {}) {
	const validInput: CGSDVXScore = {
		internalId: 1, // ALBIDA (Remix) ADV
		difficulty: 1,
		dateTime: "2019-06-06 08:14:22",
		score: 9_123_000,
		version: 6,
		clearType: 2,
		critical: 100,
		near: 50,
		error: 10,
		exScore: 1234,
		maxChain: 300,
		scoreGrade: "whatever, this is unused",
	};

	return dmf(validInput, modifant);
}

// we use any here because it's not easy to allow deep partials
function mkOutput(modifant: any = {}): DryScore<"sdvx:Single"> {
	const validOutput: DryScore<"sdvx:Single"> = {
		comment: null,
		game: "sdvx",
		importType: "api/cg-dev-sdvx",
		timeAchieved: 1559805262000,
		service: "dev",
		scoreData: {
			grade: "A+",
			percent: 91.23,
			score: 9_123_000,
			lamp: "EXCESSIVE CLEAR",
			judgements: {
				critical: 100,
				near: 50,
				miss: 10,
			},
			hitMeta: {},
		},
		scoreMeta: {},
	};

	return dmf(validOutput, modifant);
}

t.test("#ConverterAPICGSDVX", (t) => {
	const context: CGContext = {
		service: "dev",
		userID: 1,
	};

	const convert = (modifant: Partial<CGSDVXScore> = {}) =>
		ConverterAPICGSDVX(mkInput(modifant), context, "api/cg-dev-sdvx", logger);

	t.test("Valid Input", async (t) => {
		const res = await convert();

		t.hasStrict(res, {
			song: {
				id: 1,
			},
			chart: {
				difficulty: "ADV",
				data: {
					inGameID: 1,
				},
			},
			dryScore: mkOutput(),
		});

		t.end();
	});

	t.test("Lamps", async (t) => {
		t.hasStrict(await convert({ clearType: 0 }), {
			dryScore: mkOutput({ scoreData: { lamp: "FAILED" } }),
		});
		t.hasStrict(await convert({ clearType: 1 }), {
			dryScore: mkOutput({ scoreData: { lamp: "CLEAR" } }),
		});
		t.hasStrict(await convert({ clearType: 2 }), {
			dryScore: mkOutput({ scoreData: { lamp: "EXCESSIVE CLEAR" } }),
		});
		t.hasStrict(await convert({ clearType: 3 }), {
			dryScore: mkOutput({ scoreData: { lamp: "ULTIMATE CHAIN" } }),
		});
		t.hasStrict(await convert({ clearType: 4 }), {
			dryScore: mkOutput({ scoreData: { lamp: "PERFECT ULTIMATE CHAIN" } }),
		});

		t.end();
	});

	t.end();
});
