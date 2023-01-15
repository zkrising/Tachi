import { IsNullish } from "util/misc";
import { NumericSOV } from "util/sorts";
import { GPTClientImplementation } from "lib/types";
import { COLOUR_SET, GPTStrings } from "tachi-common";
import { FormatSieglindeBMS } from "tachi-common/config/game-support/bms";
import { CreateRatingSys } from "./_util";

const BMS_PMS_IMPL: GPTClientImplementation<GPTStrings["bms" | "pms"]> = {
	difficultyColours: {
		CHART: COLOUR_SET.gray, // lol
	},
	enumColours: {
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
	},
	classColours: {},
	ratingSystems: [
		CreateRatingSys(
			"Sieglinde EC",
			"TODO lol",
			(c) => c.data.sglEC,
			(c) => (IsNullish(c.data.sglEC) ? null : FormatSieglindeBMS(c.data.sglEC!))
		),
		CreateRatingSys(
			"Sieglinde HC",
			"TODO lol",
			(c) => c.data.sglHC,
			(c) => (IsNullish(c.data.sglHC) ? null : FormatSieglindeBMS(c.data.sglHC!))
		),
	],
	scoreHeaders: [
		["Score", "Score", NumericSOV((x) => x.scoreData.percent)],
		["Deltas", "Deltas", NumericSOV((x) => x.scoreData.percent)],
		["Lamp", "Lamp", NumericSOV((x) => x.scoreData.enumIndexes.lamp)],
	],
};

export const;
