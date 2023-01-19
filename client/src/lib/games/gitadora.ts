import { NumericSOV } from "util/sorts";
import { GPTClientImplementation } from "lib/types";
import { COLOUR_SET, GPTStrings } from "tachi-common";
import { bg, bgc } from "./_util";

const GITADORA_ENUM_COLOURS: GPTClientImplementation<
	"gitadora:Dora" | "gitadora:Gita"
>["enumColours"] = {
	grade: {
		C: COLOUR_SET.purple,
		B: COLOUR_SET.blue,
		A: COLOUR_SET.green,
		S: COLOUR_SET.orange,
		SS: COLOUR_SET.gold,
		MAX: COLOUR_SET.white,
	},
	lamp: {
		FAILED: COLOUR_SET.red,
		CLEAR: COLOUR_SET.blue,
		"FULL COMBO": COLOUR_SET.teal,
		EXCELLENT: COLOUR_SET.gold,
	},
};

const GITADORA_HEADERS: GPTClientImplementation<"gitadora:Dora" | "gitadora:Gita">["scoreHeaders"] =
	[
		["Percent", "Percent", NumericSOV((x) => x.scoreData.percent)],
		["Judgements", "Hits", NumericSOV((x) => x.scoreData.percent)],
		["Lamp", "Lamp", NumericSOV((x) => x.scoreData.enumIndexes.lamp)],
	];

const GITADORA_COLOURS: GPTClientImplementation<GPTStrings["gitadora"]>["classColours"] = {
	colour: {
		WHITE: bgc("white", "black"),
		ORANGE: bg("orange"),
		ORANGE_GRD: bg("orange"),
		YELLOW: "warning",
		YELLOW_GRD: "warning",
		GREEN: bg("green"),
		GREEN_GRD: bg("green"),
		BLUE: "info",
		BLUE_GRD: "info",
		PURPLE: bg("purple"),
		PURPLE_GRD: bg("purple"),
		RED: "danger",
		RED_GRD: "danger",
		BRONZE: bg("bronze"),
		SILVER: bgc("silver", "black"),
		GOLD: bg("gold"),

		RAINBOW: {
			background:
				"linear-gradient(-45deg, #f0788a, #f48fb1, #9174c2, #79bcf2, #70a173, #f7ff99, #faca7d, #ff9d80, #f0788a)",
		},
	},
};

export const GITADORA_GITA_IMPL: GPTClientImplementation<"gitadora:Gita"> = {
	enumIcons: {
		grade: "sort-alpha-up",
		lamp: "lightbulb",
	},
	enumColours: GITADORA_ENUM_COLOURS,
	difficultyColours: {
		BASIC: COLOUR_SET.blue,
		ADVANCED: COLOUR_SET.orange,
		EXTREME: COLOUR_SET.red,
		MASTER: COLOUR_SET.purple,
		"BASS BASIC": COLOUR_SET.vibrantBlue,
		"BASS ADVANCED": COLOUR_SET.vibrantOrange,
		"BASS EXTREME": COLOUR_SET.vibrantRed,
		"BASS MASTER": COLOUR_SET.vibrantPurple,
	},
	ratingSystems: [],
	scoreHeaders: GITADORA_HEADERS,
	classColours: GITADORA_COLOURS,
};

export const GITADORA_DORA_IMPL: GPTClientImplementation<"gitadora:Dora"> = {
	enumIcons: {
		grade: "sort-alpha-up",
		lamp: "lightbulb",
	},
	enumColours: GITADORA_ENUM_COLOURS,
	difficultyColours: {
		BASIC: COLOUR_SET.blue,
		ADVANCED: COLOUR_SET.orange,
		EXTREME: COLOUR_SET.red,
		MASTER: COLOUR_SET.purple,
	},
	ratingSystems: [],
	scoreHeaders: GITADORA_HEADERS,
	classColours: GITADORA_COLOURS,
};
