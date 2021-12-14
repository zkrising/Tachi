import { KtLogger } from "lib/logger/logger";
import { ParserFunctionReturns } from "../../common/types";
import { LR2HookContext, LR2HookScore } from "./types";
import p, { PrudenceSchema } from "prudence";
import ScoreImportFatalError from "lib/score-import/framework/score-importing/score-import-error";
import { FormatPrError } from "utils/prudence";

const SUPPORTED_RANDOMS = ["NONRAN", "MIRROR", "RAN", "S-RAN"];

const PR_LR2Hook: PrudenceSchema = {
	md5: "string",
	playerData: {
		autoScr: p.is(0),
		// don't really need this, but it's
		// { "ALL", "SINGLE", "7K", "5K", "DOUBLE", "14K", "10K", "9K" };
		gameMode: p.any,
		// ALLSCR and H-RAN may also be sent, but we don't support them.
		random: p.isIn(SUPPORTED_RANDOMS),
		gauge: p.isIn("GROOVE", "HARD", "HAZARD", "EASY", "P-ATTACK", "G-ATTACK"),
	},
	scoreData: {
		pgreat: p.isPositiveInteger,
		great: p.isPositiveInteger,
		good: p.isPositiveInteger,
		bad: p.isPositiveInteger,
		poor: p.isPositiveInteger,
		maxCombo: p.isPositiveInteger,
		exScore: p.isPositiveInteger,
		moneyScore: p.isPositiveInteger,
		notesTotal: p.isPositiveInteger,
		notesPlayed: p.isPositiveInteger,
		lamp: p.isIn("NO PLAY", "FAIL", "EASY", "NORMAL", "HARD", "FULL COMBO"),
		hpGraph: (self) => {
			if (!Array.isArray(self)) {
				return "Expected an array";
			}
			if (self.length !== 1000) {
				return "Expected an array with length 1000.";
			}
			if (self.some((x) => x < 0 || x > 100 || !Number.isInteger(x))) {
				return "Expected an array of 1000 integers between 0 and 100.";
			}

			return true;
		},
	},
};

export function ParseLR2Hook(
	body: Record<string, unknown>,
	logger: KtLogger
): ParserFunctionReturns<LR2HookScore, LR2HookContext> {
	// Ignore excess keys, as lr2hook is likely to add more features in the future.
	const err = p(
		body,
		PR_LR2Hook,
		{
			playerData: {
				autoScr:
					"Auto Scratch cannot be turned on, as it is treated as an EASY CLEAR by LR2.",
				random: `Expected any of ${SUPPORTED_RANDOMS.join(
					", "
				)}. Note that ALLSCR and H-RAN are not supported!`,
			},
		},
		{ allowExcessKeys: true }
	);

	if (err) {
		throw new ScoreImportFatalError(400, FormatPrError(err));
	}

	const score = body as unknown as LR2HookScore;

	return {
		game: "bms",
		iterable: [score],
		context: {
			timeReceived: Date.now(),
		},
		classHandler: null,
	};
}
