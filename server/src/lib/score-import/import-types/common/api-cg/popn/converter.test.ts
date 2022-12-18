import { ConverterAPICGPopn } from "./converter";
import CreateLogCtx from "lib/logger/logger";
import t from "tap";
import { dmf } from "test-utils/misc";
import type { CGContext, CGPopnScore } from "../types";
import type { DryScore } from "lib/score-import/framework/common/types";

const logger = CreateLogCtx(__filename);

function mkInput(modifant: Partial<CGPopnScore> = {}) {
	const validInput: CGPopnScore = {
		internalId: 0, // this is "i really wanna hurt you"
		difficulty: 0,
		coolCount: 100,
		badCount: 50,
		greatCount: 15,
		goodCount: 25,
		clearFlag: 5, // clear,
		dateTime: "2019-06-06 08:14:22",
		score: 87_000,
		version: 25,
	};

	return dmf(validInput, modifant);
}

// we use any here because it's not easy to allow deep partials
function mkOutput(modifant: any = {}): DryScore<"popn:9B"> {
	const validOutput: DryScore<"popn:9B"> = {
		comment: null,
		game: "popn",
		importType: "api/cg-dev-popn",
		timeAchieved: 1559805262000,
		service: "CG Dev",
		scoreData: {
			grade: "A",
			percent: 87,
			score: 87000,
			lamp: "CLEAR",
			judgements: {
				cool: 100,
				great: 15,
				good: 25,
				bad: 50,
			},
			hitMeta: {
				specificClearType: "clearCircle",
			},
		},
		scoreMeta: {},
	};

	return dmf(validOutput, modifant);
}

t.test("#ConverterAPICGPopn", (t) => {
	const context: CGContext = {
		service: "dev",
		userID: 1,
	};

	const convert = (modifant: Partial<CGPopnScore> = {}) =>
		ConverterAPICGPopn(mkInput(modifant), context, "api/cg-dev-popn", logger);

	t.test("Valid Input", async (t) => {
		const res = await convert();

		t.hasStrict(res, {
			song: {
				id: 1,
			},
			chart: {
				difficulty: "Easy",
				data: {
					inGameID: 0,
				},
			},
			dryScore: mkOutput(),
		});

		t.end();
	});

	t.test("Should cap fails at A grade", async (t) => {
		const res = await convert({
			clearFlag: 1,
			score: 98_000,
		});

		t.hasStrict(res, {
			dryScore: mkOutput({
				scoreData: {
					lamp: "FAILED",
					grade: "A",
					score: 98_000,
					percent: 98,
					hitMeta: {
						specificClearType: "failedCircle",
					},
				},
			}),
		});

		const res2 = await convert({
			score: 98_000,
		});

		t.hasStrict(res2, {
			dryScore: mkOutput({
				scoreData: {
					grade: "S",
					score: 98_000,
					percent: 98,
				},
			}),
		});

		t.end();
	});

	t.end();
});
