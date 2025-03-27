import { ConverterAPICGJubeat } from "./converter";
import CreateLogCtx from "lib/logger/logger";
import { ParseDateFromString } from "lib/score-import/framework/common/score-utils";
import t from "tap";
import { dmf } from "test-utils/misc";
import type { CGContext, CGJubeatScore } from "../types";
import type { DryScore } from "lib/score-import/framework/common/types";

const logger = CreateLogCtx(__filename);

function mkInput(modifant: Partial<CGJubeatScore> = {}) {
	const validInput: CGJubeatScore = {
		internalId: 1, // FIXME: what chart is this?
		difficulty: 2, // HARD ADV
		version: 10, // ave
		dateTime: "2019-06-06 08:14:22",
		score: 947_184,
		hardMode: true,
		perfectCount: 100,
		greatCount: 50,
		goodCount: 25,
		poorCount: 0,
		missCount: 0,
		musicRate: 950,
		clearFlag: 0, // unknown, unused
	};

	return dmf(validInput, modifant);
}

// we use any here because it's not easy to allow deep partials
function mkOutput(modifant: any = {}): DryScore<"jubeat:Single"> {
	const validOutput: DryScore<"jubeat:Single"> = {
		comment: null,
		game: "jubeat",
		importType: "api/cg-dev-jubeat",

		// we handle it like this because -- with no timezone info
		// this will fail in CI; it has a different timezone there!
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
			},
			musicRate: 95.0,
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
				difficulty: "HARD ADV",
				data: {
					inGameID: 1,
				},
			},
			dryScore: mkOutput(),
		});

		t.end();
	});

	t.test("Lamps", async (t) => {
		t.hasStrict(
			await convert({
				score: 690_000,
				missCount: 1, // at least a miss otherwise it's an FC
			}),
			{
				dryScore: mkOutput({ scoreData: { lamp: "FAILED" } }),
			}
		);
		t.hasStrict(
			await convert({
				score: 700_000,
				missCount: 1,
			}),
			{
				dryScore: mkOutput({ scoreData: { lamp: "CLEAR" } }),
			}
		);
		t.hasStrict(
			await convert({
				missCount: 0,
				poorCount: 0,
			}),
			{
				dryScore: mkOutput({ scoreData: { lamp: "FULL COMBO" } }),
			}
		);
		t.hasStrict(
			await convert({
				missCount: 0,
				poorCount: 0,
			}),
			{
				dryScore: mkOutput({ scoreData: { lamp: "FULL COMBO" } }),
			}
		);
		t.hasStrict(
			await convert({
				missCount: 0,
				poorCount: 0,
				goodCount: 0,
				greatCount: 0,
				score: 1_000_000,
			}),
			{
				dryScore: mkOutput({ scoreData: { lamp: "EXCELLENT" } }),
			}
		);

		t.end();
	});

	t.end();
});
