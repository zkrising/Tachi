import { SDVXDans } from "lib/constants/classes";
import { KtLogger } from "lib/logger/logger";
import ScoreImportFatalError from "lib/score-import/framework/score-importing/score-import-error";
import p, { PrudenceSchema } from "prudence";
import { FormatPrError } from "utils/prudence";
import { EmptyObject } from "utils/types";
import { ParserFunctionReturns } from "../../common/types";
import { KsHookSV3CScore } from "./types";

const PR_KsHookSV3C: PrudenceSchema = {
	appeal_id: p.isPositiveInteger,
	clear: p.isIn(
		"CLEAR_PLAYED",
		"CLEAR_EFFECTIVE",
		"CLEAR_EXCESSIVE",
		"CLEAR_ULTIMATE_CHAIN",
		"CLEAR_PERFECT"
	),
	difficulty: p.isIn(
		"DIFFICULTY_NOVICE",
		"DIFFICULTY_ADVANCED",
		"DIFFICULTY_EXHAUST",
		"DIFFICULTY_INFINITE",
		"DIFFICULTY_MAXIMUM"
	),
	early: p.isPositiveInteger,
	late: p.isPositiveInteger,
	gauge: p.isBetween(0, 100),
	grade: p.isIn(
		"GRADE_D",
		"GRADE_C",
		"GRADE_B",
		"GRADE_A",
		"GRADE_A_PLUS",
		"GRADE_AA",
		"GRADE_AA_PLUS",
		"GRADE_AAA",
		"GRADE_AAA_PLUS",
		"GRADE_S"
	),
	max_chain: p.isPositiveInteger,
	music_id: p.isPositiveInteger,

	btn_rate: p.isBetween(0, 200),
	long_rate: p.isBetween(0, 200),
	vol_rate: p.isBetween(0, 200),

	player_name: "string",
	rate: p.isIn("RATE_EFFECTIVE", "RATE_PERMISSIVE", "RATE_EXCESSIVE", "RATE_BLASTIVE"),

	skill_frame: p.isIn(
		"SKILL_FRAME_NONE",
		"SKILL_FRAME_SILVER",
		"SKILL_FRAME_GOLD",
		"SKILL_FRAME_GOLD_HALO"
	),
	skill_level: p.isIn(
		"SKILL_LEVEL_NONE",
		"SKILL_LEVEL_01",
		"SKILL_LEVEL_02",
		"SKILL_LEVEL_03",
		"SKILL_LEVEL_04",
		"SKILL_LEVEL_05",
		"SKILL_LEVEL_06",
		"SKILL_LEVEL_07",
		"SKILL_LEVEL_08",
		"SKILL_LEVEL_09",
		"SKILL_LEVEL_10",
		"SKILL_LEVEL_11",
		"SKILL_LEVEL_12"
	),
	track_no: p.isPositiveInteger,
};

export function ParseKsHookSV3C(
	body: Record<string, unknown>,
	logger: KtLogger
): ParserFunctionReturns<KsHookSV3CScore, EmptyObject> {
	// Ignore excess keys, as SV3C might add more features in the future.
	const err = p(body, PR_KsHookSV3C, undefined, { allowExcessKeys: true });

	if (err) {
		throw new ScoreImportFatalError(400, FormatPrError(err));
	}

	const score = body as unknown as KsHookSV3CScore;

	return {
		game: "sdvx",
		iterable: [score],
		context: {},
		classHandler: () => {
			const skillLevel = ConvertSkillLevel(score.skill_level);

			// If null, the player doesn't have a dan.
			if (!skillLevel) {
				return;
			}

			return {
				dan: skillLevel,
			};
		},
	};
}

export function ConvertSkillLevel(skill: KsHookSV3CScore["skill_level"]): SDVXDans | null {
	switch (skill) {
		case "SKILL_LEVEL_01":
			return SDVXDans.DAN_1;
		case "SKILL_LEVEL_02":
			return SDVXDans.DAN_2;
		case "SKILL_LEVEL_03":
			return SDVXDans.DAN_3;
		case "SKILL_LEVEL_04":
			return SDVXDans.DAN_4;
		case "SKILL_LEVEL_05":
			return SDVXDans.DAN_5;
		case "SKILL_LEVEL_06":
			return SDVXDans.DAN_6;
		case "SKILL_LEVEL_07":
			return SDVXDans.DAN_7;
		case "SKILL_LEVEL_08":
			return SDVXDans.DAN_8;
		case "SKILL_LEVEL_09":
			return SDVXDans.DAN_9;
		case "SKILL_LEVEL_10":
			return SDVXDans.DAN_10;
		case "SKILL_LEVEL_11":
			return SDVXDans.DAN_11;
		case "SKILL_LEVEL_12":
			return SDVXDans.INF;
		default:
			return null;
	}
}
