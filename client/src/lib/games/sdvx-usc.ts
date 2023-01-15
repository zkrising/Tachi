import { NumericSOV } from "util/sorts";
import { GPTClientImplementation } from "lib/types";
import { COLOUR_SET, GPTStrings } from "tachi-common";
import { CreateRatingSys } from "./_util";

const SDVXLIKE_ENUM_COLOURS: GPTClientImplementation<GPTStrings["usc" | "sdvx"]>["enumColours"] = {
	grade: {
		D: COLOUR_SET.gray,
		C: COLOUR_SET.red,
		B: COLOUR_SET.maroon,
		A: COLOUR_SET.paleBlue,
		"A+": COLOUR_SET.blue,
		AA: COLOUR_SET.paleGreen,
		"AA+": COLOUR_SET.green,
		AAA: COLOUR_SET.gold,
		"AAA+": COLOUR_SET.vibrantOrange,
		S: COLOUR_SET.teal,
		PUC: COLOUR_SET.pink,
	},
	lamp: {
		FAILED: COLOUR_SET.red,
		CLEAR: COLOUR_SET.green,
		"EXCESSIVE CLEAR": COLOUR_SET.purple,
		"ULTIMATE CHAIN": COLOUR_SET.teal,
		"PERFECT ULTIMATE CHAIN": COLOUR_SET.gold,
	},
};

export const SDVX_IMPL: GPTClientImplementation<"sdvx:Single"> = {
	enumColours: SDVXLIKE_ENUM_COLOURS,
	difficultyColours: {
		NOV: COLOUR_SET.purple,
		ADV: COLOUR_SET.vibrantYellow,
		EXH: COLOUR_SET.red,
		INF: COLOUR_SET.vibrantPink,
		GRV: COLOUR_SET.orange,
		HVN: COLOUR_SET.teal,
		VVD: COLOUR_SET.pink,
		XCD: COLOUR_SET.blue,
		MXM: COLOUR_SET.white,
	},
	ratingSystems: [
		CreateRatingSys(
			"Tierlist",
			"The unofficial SDVX clearing tierlist",
			(c) => c.data.clearTier?.value,
			(c) => c.data.clearTier?.text,
			(c) => c.data.clearTier?.individualDifference
		),
	],
	scoreHeaders: [
		["Score", "Score", NumericSOV((x) => x?.scoreData.score)],
		["Near - Miss", "Nr. Ms.", NumericSOV((x) => x?.scoreData.score)],
		["Lamp", "Lamp", NumericSOV((x) => x?.scoreData.enumIndexes.lamp)],
	],
};
export const USC_IMPL: GPTClientImplementation<GPTStrings["usc"]> = {
	enumColours: SDVXLIKE_ENUM_COLOURS,
	difficultyColours: {
		NOV: COLOUR_SET.purple,
		ADV: COLOUR_SET.vibrantYellow,
		EXH: COLOUR_SET.red,
		INF: COLOUR_SET.vibrantPink,
	},
	ratingSystems: [],
	scoreHeaders: [
		["Score", "Score", NumericSOV((x) => x?.scoreData.score)],
		["Near - Miss", "Nr. Ms.", NumericSOV((x) => x?.scoreData.score)],
		["Lamp", "Lamp", NumericSOV((x) => x?.scoreData.enumIndexes.lamp)],
	],
};
