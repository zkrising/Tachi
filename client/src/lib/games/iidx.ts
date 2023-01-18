import { NumericSOV } from "util/sorts";
import { GPTClientImplementation } from "lib/types";
import { COLOUR_SET, GPTStrings } from "tachi-common";
import { CreateRatingSys, bg, bgc } from "./_util";

const IIDX_ENUM_COLOURS: GPTClientImplementation<GPTStrings["iidx"]>["enumColours"] = {
	grade: {
		F: COLOUR_SET.gray,
		E: COLOUR_SET.red,
		D: COLOUR_SET.maroon,
		C: COLOUR_SET.purple,
		B: COLOUR_SET.paleBlue,
		A: COLOUR_SET.green,
		AA: COLOUR_SET.blue,
		AAA: COLOUR_SET.gold,
		"MAX-": COLOUR_SET.teal,
		MAX: COLOUR_SET.white,
	},
	lamp: {
		"NO PLAY": COLOUR_SET.gray,
		FAILED: COLOUR_SET.red,
		"ASSIST CLEAR": COLOUR_SET.purple,
		"EASY CLEAR": COLOUR_SET.green,
		CLEAR: COLOUR_SET.blue,
		"HARD CLEAR": COLOUR_SET.orange,
		"EX HARD CLEAR": COLOUR_SET.gold,
		"FULL COMBO": COLOUR_SET.teal,
	},
};

const IIDX_DIFF_COLOURS: GPTClientImplementation<GPTStrings["iidx"]>["difficultyColours"] = {
	NORMAL: COLOUR_SET.blue,
	HYPER: COLOUR_SET.orange,
	ANOTHER: COLOUR_SET.red,
	LEGGENDARIA: COLOUR_SET.purple,
	"All Scratch NORMAL": COLOUR_SET.blue,
	"All Scratch HYPER": COLOUR_SET.orange,
	"All Scratch ANOTHER": COLOUR_SET.red,
	"All Scratch LEGGENDARIA": COLOUR_SET.purple,
	"Kichiku NORMAL": COLOUR_SET.blue,
	"Kichiku HYPER": COLOUR_SET.orange,
	"Kichiku ANOTHER": COLOUR_SET.red,
	"Kichiku LEGGENDARIA": COLOUR_SET.purple,
	"Kiraku NORMAL": COLOUR_SET.blue,
	"Kiraku HYPER": COLOUR_SET.orange,
	"Kiraku ANOTHER": COLOUR_SET.red,
	"Kiraku LEGGENDARIA": COLOUR_SET.purple,
};

const IIDX_HEADERS: GPTClientImplementation<"iidx:SP" | "iidx:DP">["scoreHeaders"] = [
	["Score", "Score", NumericSOV((x) => x.scoreData.percent)],
	["Deltas", "Deltas", NumericSOV((x) => x.scoreData.percent)],
	["Lamp", "Lamp", NumericSOV((x) => x.scoreData.enumIndexes.lamp)],
];

const IIDX_COLOURS: GPTClientImplementation<"iidx:SP" | "iidx:DP">["classColours"] = {
	dan: {
		KYU_7: bg("green"),
		KYU_6: bg("green"),
		KYU_5: bg("green"),
		KYU_4: bg("green"),
		KYU_3: bg("green"),
		KYU_2: bg("green"),
		KYU_1: bg("green"),
		DAN_1: "info",
		DAN_2: "info",
		DAN_3: "info",
		DAN_4: "info",
		DAN_5: "info",
		DAN_6: "info",
		DAN_7: "info",
		DAN_8: "info",
		DAN_9: "danger",
		DAN_10: "danger",
		CHUUDEN: bgc("silver", "black"),
		KAIDEN: "warning",
	},
};

export const IIDX_SP_IMPL: GPTClientImplementation<"iidx:SP"> = {
	difficultyColours: IIDX_DIFF_COLOURS,
	enumColours: IIDX_ENUM_COLOURS,
	enumIcons: {
		grade: "sort-alpha-up",
		lamp: "lightbulb",
	},
	ratingSystems: [
		CreateRatingSys(
			"NC Tier",
			"Tierlist Ratings for Normal Clears.",
			(c) => c.data.ncTier?.value,
			(c) => c.data.ncTier?.text,
			(c) => c.data.ncTier?.individualDifference
		),
		CreateRatingSys(
			"HC Tier",
			"Tierlist Ratings for Hard Clears.",
			(c) => c.data.hcTier?.value,
			(c) => c.data.hcTier?.text,
			(c) => c.data.hcTier?.individualDifference
		),
		CreateRatingSys(
			"EXHC Tier",
			"Tierlist Ratings for EX-HARD Clears.",
			(c) => c.data.exhcTier?.value,
			(c) => c.data.exhcTier?.text,
			(c) => c.data.exhcTier?.individualDifference
		),
	],
	scoreHeaders: IIDX_HEADERS,
	classColours: IIDX_COLOURS,
};

export const IIDX_DP_IMPL: GPTClientImplementation<"iidx:DP"> = {
	difficultyColours: IIDX_DIFF_COLOURS,
	enumColours: IIDX_ENUM_COLOURS,
	enumIcons: {
		grade: "sort-alpha-up",
		lamp: "lightbulb",
	},
	ratingSystems: [
		CreateRatingSys(
			"DP Tier",
			"The unofficial DP tiers, taken from https://zasa.sakura.ne.jp/dp/run.php.",
			(c) => c.data.dpTier?.value,
			(c) => c.data.dpTier?.text
		),
	],
	scoreHeaders: IIDX_HEADERS,
	classColours: IIDX_COLOURS,
};
