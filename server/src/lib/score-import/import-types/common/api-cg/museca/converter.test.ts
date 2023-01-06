import { ConverterAPICGMuseca } from "./converter";
import CreateLogCtx from "lib/logger/logger";
import { ParseDateFromString } from "lib/score-import/framework/common/score-utils";
import t from "tap";
import { dmf } from "test-utils/misc";
import type { CGContext, CGMusecaScore } from "../types";
import type { DryScore } from "lib/score-import/framework/common/types";

const logger = CreateLogCtx(__filename);

function mkInput(modifant: Partial<CGMusecaScore> = {}) {
	const validInput: CGMusecaScore = {
		internalId: 1, // ALBIDA (Remix) ADV
		difficulty: 0,
		dateTime: "2019-06-06 08:14:22",
		score: 912_000,
		version: 1,
		clearType: 2,
		critical: 100,
		near: 50,
		error: 10,
		maxChain: 300,
		scoreGrade: "whatever, this is unused",
	};

	return dmf(validInput, modifant);
}

// we use any here because it's not easy to allow deep partials
function mkOutput(modifant: any = {}): DryScore<"museca:Single"> {
	const validOutput: DryScore<"museca:Single"> = {
		comment: null,
		game: "museca",
		importType: "api/cg-dev-museca",

		// we handle it like this because -- with no timezone info
		// this will fail in CI; it has a different timezone there!
		timeAchieved: ParseDateFromString("2019-06-06 08:14:22"),
		service: "CG Dev",
		scoreData: {
			grade: "優",
			percent: 91.2,
			score: 912_000,
			lamp: "CLEAR",
			judgements: {
				critical: 100,
				near: 50,
				miss: 10,
			},
			optional: {},
		},
		scoreMeta: {},
	};

	return dmf(validOutput, modifant);
}

t.test("#ConverterAPICGMuseca", (t) => {
	const context: CGContext = {
		service: "dev",
		userID: 1,
	};

	const convert = (modifant: Partial<CGMusecaScore> = {}) =>
		ConverterAPICGMuseca(mkInput(modifant), context, "api/cg-dev-museca", logger);

	t.test("Valid Input", async (t) => {
		const res = await convert();

		t.hasStrict(res, {
			song: {
				id: 1,
			},
			chart: {
				difficulty: "Green",
				data: {
					inGameID: 1,
				},
			},
			dryScore: mkOutput(),
		});

		t.end();
	});

	t.test("Lamps", async (t) => {
		t.hasStrict(await convert({ score: 1_000_000 }), {
			dryScore: { scoreData: { lamp: "PERFECT CONNECT ALL" } },
		});
		t.hasStrict(await convert({ score: 900_000, error: 0 }), {
			dryScore: { scoreData: { lamp: "CONNECT ALL" } },
		});
		t.hasStrict(await convert({ score: 800_000, error: 10 }), {
			dryScore: { scoreData: { lamp: "CLEAR" } },
		});
		t.hasStrict(await convert({ score: 700_000, error: 10 }), {
			dryScore: { scoreData: { lamp: "FAILED" } },
		});
		t.hasStrict(await convert({ score: 799_999, error: 10 }), {
			dryScore: { scoreData: { lamp: "FAILED" } },
		});

		t.end();
	});

	t.end();
});
