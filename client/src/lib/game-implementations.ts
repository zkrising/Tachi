import { NumericSOV } from "util/sorts";
import { COLOUR_SET, GPTString, GetGPTString, PBScoreDocument, ScoreDocument } from "tachi-common";
import { GITADORA_DORA_IMPL, GITADORA_GITA_IMPL } from "./games/gitadora";
import { SDVX_IMPL, USC_IMPL } from "./games/sdvx-usc";
import { GPTClientImplementation } from "./types";
import { IIDX_DP_IMPL, IIDX_SP_IMPL } from "./games/iidx";
import { BMS_14K_IMPL, BMS_7K_IMPL, PMS_IMPL } from "./games/bms-pms";
import { bg, bgc } from "./games/_util";

type GPTClientImplementations = {
	[GPT in GPTString]: GPTClientImplementation<GPT>;
};

export const GPT_CLIENT_IMPLEMENTATIONS: GPTClientImplementations = {
	"iidx:SP": IIDX_SP_IMPL,
	"iidx:DP": IIDX_DP_IMPL,
	"chunithm:Single": {
		classColours: {
			colour: {
				BLUE: "info",
				GREEN: bg("green"),
				ORANGE: bg("orange"),
				RED: "danger",
				PURPLE: bg("purple"),
				COPPER: bg("bronze"),
				SILVER: "secondary",
				GOLD: "warning",
				PLATINUM: bgc("silver", "black"),
				RAINBOW: "success",
			},
		},
		enumColours: {
			grade: {
				D: COLOUR_SET.red,
				C: COLOUR_SET.purple,
				B: COLOUR_SET.paleBlue,
				BB: COLOUR_SET.blue,
				BBB: COLOUR_SET.vibrantBlue,
				A: COLOUR_SET.paleGreen,
				AA: COLOUR_SET.green,
				AAA: COLOUR_SET.vibrantGreen,
				S: COLOUR_SET.vibrantOrange,
				SS: COLOUR_SET.vibrantYellow,
				SSS: COLOUR_SET.teal,
			},
			lamp: {
				FAILED: COLOUR_SET.red,
				CLEAR: COLOUR_SET.paleGreen,
				"FULL COMBO": COLOUR_SET.paleBlue,
				"ALL JUSTICE": COLOUR_SET.gold,
				"ALL JUSTICE CRITICAL": COLOUR_SET.white,
			},
		},
		difficultyColours: {
			BASIC: COLOUR_SET.blue,
			ADVANCED: COLOUR_SET.orange,
			EXPERT: COLOUR_SET.red,
			MASTER: COLOUR_SET.purple,
		},
		ratingSystems: [],
		scoreHeaders: [
			["Score", "Score", NumericSOV((x) => x.scoreData.score)],
			["Judgements", "Hits", NumericSOV((x) => x.scoreData.score)],
			["Lamp", "Lamp", NumericSOV((x) => x.scoreData.enumIndexes.lamp)],
		],
	},
	"jubeat:Single": {
		enumColours: {
			lamp: {
				FAILED: COLOUR_SET.red,
				CLEAR: COLOUR_SET.blue,
				"FULL COMBO": COLOUR_SET.teal,
				EXCELLENT: COLOUR_SET.white,
			},
			grade: {
				E: COLOUR_SET.gray,
				D: COLOUR_SET.maroon,
				C: COLOUR_SET.red,
				B: COLOUR_SET.blue,
				A: COLOUR_SET.green,
				S: COLOUR_SET.gold,
				SS: COLOUR_SET.orange,
				SSS: COLOUR_SET.teal,
				EXC: COLOUR_SET.white,
			},
		},
		classColours: {
			colour: {
				BLACK: bg("secondary"),
				YELLOW_GREEN: bgc("yellowgreen", "black"),
				GREEN: bg("green"),
				LIGHT_BLUE: bgc("cyan", "black"),
				BLUE: bg("info"),
				VIOLET: bg("violet"),
				PURPLE: bg("purple"),
				PINK: bgc("pink", "black"),
				ORANGE: bg("orange"),
				GOLD: bg("warning"),
			},
		},
		difficultyColours: {
			BSC: COLOUR_SET.green,
			ADV: COLOUR_SET.gold,
			EXT: COLOUR_SET.red,
			"HARD BSC": COLOUR_SET.darkGreen,
			"HARD ADV": COLOUR_SET.orange,
			"HARD EXT": COLOUR_SET.vibrantRed,
		},
		ratingSystems: [],
		scoreHeaders: [
			["Score", "Score", NumericSOV((x) => x?.scoreData.score ?? -Infinity)],
			["Judgements", "Hits", NumericSOV((x) => x?.scoreData.score ?? -Infinity)],
			["Lamp", "Lamp", NumericSOV((x) => x?.scoreData.enumIndexes.lamp ?? -Infinity)],
		],
	},
	"maimaidx:Single": {
		enumColours: {
			lamp: {
				FAILED: COLOUR_SET.red,
				CLEAR: COLOUR_SET.green,
				"FULL COMBO": COLOUR_SET.blue,
				"FULL COMBO+": COLOUR_SET.paleBlue,
				"ALL PERFECT": COLOUR_SET.gold,
				"ALL PERFECT+": COLOUR_SET.teal,
			},
			grade: {
				D: COLOUR_SET.gray,
				C: COLOUR_SET.red,
				B: COLOUR_SET.maroon,
				BB: COLOUR_SET.purple,
				BBB: COLOUR_SET.paleGreen,
				A: COLOUR_SET.green,
				AA: COLOUR_SET.paleBlue,
				AAA: COLOUR_SET.blue,
				S: COLOUR_SET.gold,
				"S+": COLOUR_SET.vibrantYellow,
				SS: COLOUR_SET.paleOrange,
				"SS+": COLOUR_SET.orange,
				SSS: COLOUR_SET.teal,
				"SSS+": COLOUR_SET.white,
			},
		},
		classColours: {
			dan: {
				DAN_1: bg("warning"),
				DAN_2: bg("warning"),
				DAN_3: bg("warning"),
				DAN_4: bg("warning"),
				DAN_5: bg("warning"),
				DAN_6: bg("warning"),
				DAN_7: bg("warning"),
				DAN_8: bg("warning"),
				DAN_9: bg("warning"),
				DAN_10: bg("warning"),

				SHINDAN_1: bg("purple"),
				SHINDAN_2: bg("purple"),
				SHINDAN_3: bg("purple"),
				SHINDAN_4: bg("purple"),
				SHINDAN_5: bg("purple"),
				SHINDAN_6: bg("purple"),
				SHINDAN_7: bg("purple"),
				SHINDAN_8: bg("purple"),
				SHINDAN_9: bg("purple"),
				SHINDAN_10: bg("purple"),

				SHINKAIDEN: bg("purple"),
			},
			colour: {
				WHITE: bgc("white", "black"),
				BLUE: bgc("cyan", "black"),
				GREEN: bg("green"),
				YELLOW: bgc("yellow", "black"),
				RED: bg("red"),
				PURPLE: bg("purple"),
				BRONZE: bg("brown"),
				SILVER: bg("gray"),
				GOLD: bg("warning"),
				PLATINUM: bgc("lightgoldenrodyellow", "black"),

				RAINBOW: {
					background:
						"linear-gradient(-45deg, #f0788a, #f48fb1, #9174c2, #79bcf2, #70a173, #f7ff99, #faca7d, #ff9d80, #f0788a)",
				},
			},
		},
		difficultyColours: {
			Basic: COLOUR_SET.green,
			Advanced: COLOUR_SET.orange,
			Expert: COLOUR_SET.red,
			Master: COLOUR_SET.purple,
			"Re:Master": COLOUR_SET.white,
			"DX Basic": COLOUR_SET.green,
			"DX Advanced": COLOUR_SET.orange,
			"DX Expert": COLOUR_SET.red,
			"DX Master": COLOUR_SET.purple,
			"DX Re:Master": COLOUR_SET.white,
		},
		ratingSystems: [],
		scoreHeaders: [
			["Percent", "%", NumericSOV((x) => x?.scoreData.percent)],
			["Judgements", "Hits", NumericSOV((x) => x?.scoreData.percent)],
			["Lamp", "Lamp", NumericSOV((x) => x?.scoreData.enumIndexes.lamp)],
		],
	},
	"museca:Single": {
		enumColours: {
			grade: {
				没: COLOUR_SET.gray,
				拙: COLOUR_SET.maroon,
				凡: COLOUR_SET.red,
				佳: COLOUR_SET.paleGreen,
				良: COLOUR_SET.paleBlue,
				優: COLOUR_SET.green,
				秀: COLOUR_SET.blue,
				傑: COLOUR_SET.teal,
				傑G: COLOUR_SET.gold,
			},
			lamp: {
				FAILED: COLOUR_SET.red,
				CLEAR: COLOUR_SET.green,
				"CONNECT ALL": COLOUR_SET.teal,
				"PERFECT CONNECT ALL": COLOUR_SET.gold,
			},
		},
		classColours: {},
		difficultyColours: {
			Green: COLOUR_SET.green,
			Yellow: COLOUR_SET.vibrantYellow,
			Red: COLOUR_SET.red,
		},
		ratingSystems: [],

		scoreHeaders: [
			["Score", "Score", NumericSOV((x) => x?.scoreData.score)],
			["Near - Miss", "Nr. Ms.", NumericSOV((x) => x?.scoreData.score)],
			["Lamp", "Lamp", NumericSOV((x) => x?.scoreData.enumIndexes.lamp)],
		],
	},
	"popn:9B": {
		enumColours: {
			grade: {
				E: COLOUR_SET.gray,
				D: COLOUR_SET.maroon,
				C: COLOUR_SET.red,
				B: COLOUR_SET.blue,
				A: COLOUR_SET.green,
				AA: COLOUR_SET.orange,
				AAA: COLOUR_SET.gold,
				S: COLOUR_SET.teal,
			},
			lamp: {
				FAILED: COLOUR_SET.red,
				"EASY CLEAR": COLOUR_SET.green,
				CLEAR: COLOUR_SET.blue,
				"FULL COMBO": COLOUR_SET.teal,
				PERFECT: COLOUR_SET.gold,
			},
			clearMedal: {
				failedCircle: COLOUR_SET.red,
				failedDiamond: COLOUR_SET.red,
				failedStar: COLOUR_SET.red,
				easyClear: COLOUR_SET.green,
				clearCircle: COLOUR_SET.blue,
				clearDiamond: COLOUR_SET.blue,
				clearStar: COLOUR_SET.blue,
				fullComboCircle: COLOUR_SET.teal,
				fullComboDiamond: COLOUR_SET.teal,
				fullComboStar: COLOUR_SET.teal,
				perfect: COLOUR_SET.gold,
			},
		},
		classColours: {
			class: {
				KITTY: bg("brown"),
				STUDENT: bg("green"),
				DELINQUENT: bgc("lime", "black"),
				DETECTIVE: bg("purple"),
				IDOL: "danger",
				GENERAL: bg("darkgoldenrod"),
				HERMIT: "success",
				GOD: "warning",
			},
		},
		difficultyColours: {
			Easy: COLOUR_SET.blue,
			Normal: COLOUR_SET.green,
			Hyper: COLOUR_SET.orange,
			EX: COLOUR_SET.red,
		},
		ratingSystems: [],
		scoreHeaders: [
			["Score", "Score", NumericSOV((x) => x.scoreData.score)],
			["Judgements", "Hits", NumericSOV((x) => x.scoreData.score)],
			["Lamp", "Lamp", NumericSOV((x) => x.scoreData.enumIndexes.clearMedal)],
		],
	},
	"wacca:Single": {
		enumColours: {
			grade: {
				D: COLOUR_SET.gray,
				C: COLOUR_SET.maroon,
				B: COLOUR_SET.red,
				A: COLOUR_SET.paleGreen,
				AA: COLOUR_SET.green,
				AAA: COLOUR_SET.vibrantGreen,
				S: COLOUR_SET.gold,
				"S+": COLOUR_SET.vibrantYellow,
				SS: COLOUR_SET.paleOrange,
				"SS+": COLOUR_SET.orange,
				SSS: COLOUR_SET.pink,
				"SSS+": COLOUR_SET.vibrantPink,
				MASTER: COLOUR_SET.white,
			},
			lamp: {
				FAILED: COLOUR_SET.red,
				CLEAR: COLOUR_SET.blue,
				MISSLESS: COLOUR_SET.orange,
				"FULL COMBO": COLOUR_SET.pink,
				"ALL MARVELOUS": COLOUR_SET.gold,
			},
		},
		classColours: {
			colour: {
				ASH: "secondary",
				NAVY: bg("darkblue"),
				YELLOW: bg("orange"),
				RED: "danger",
				PURPLE: bg("purple"),
				BLUE: "info",
				SILVER: bgc("silver", "black"),
				GOLD: "warning",
				RAINBOW: "success",
			},
			stageUp: {
				I: null,
				II: null,
				III: null,
				IV: null,
				V: null,
				VI: null,
				VII: null,
				VIII: null,
				IX: null,
				X: null,
				XI: null,
				XII: null,
				XIII: null,
				XIV: null,
			},
		},
		difficultyColours: {
			NORMAL: COLOUR_SET.blue,
			HARD: COLOUR_SET.gold,
			EXPERT: COLOUR_SET.pink,
			INFERNO: COLOUR_SET.purple,
		},
		ratingSystems: [],
		scoreHeaders: [
			["Score", "Score", NumericSOV((x) => x.scoreData.score)],
			["Judgements", "Hits", NumericSOV((x) => x.scoreData.score)],
			["Lamp", "Lamp", NumericSOV((x) => x.scoreData.enumIndexes.lamp)],
		],
	},
	"itg:Stamina": {
		enumColours: {
			grade: {
				F: COLOUR_SET.gray,
				D: COLOUR_SET.red,
				C: COLOUR_SET.maroon,
				B: COLOUR_SET.purple,
				A: COLOUR_SET.green,
				S: COLOUR_SET.orange,
				"★": COLOUR_SET.pink,
				"★★": COLOUR_SET.vibrantPink,
				"★★★": COLOUR_SET.teal,
				"★★★★": COLOUR_SET.white,
			},
			lamp: {
				FAILED: COLOUR_SET.red,
				CLEAR: COLOUR_SET.blue,
				"FULL COMBO": COLOUR_SET.pink,
				"FULL EXCELLENT COMBO": COLOUR_SET.gold,
				QUAD: COLOUR_SET.white,
			},
		},
		difficultyColours: {
			// this game has dynamic difficulties. Formatting is handled elsewhere.
		},
		classColours: {},
		ratingSystems: [],
		scoreHeaders: [
			["Score", "Score", NumericSOV((x) => x.scoreData.finalPercent)],
			["Judgements", "Hits", NumericSOV((x) => x.scoreData.scorePercent)],
			["Lamp", "Lamp", NumericSOV((x) => x.scoreData.enumIndexes.lamp)],
		],
	},
	"gitadora:Dora": GITADORA_DORA_IMPL,
	"gitadora:Gita": GITADORA_GITA_IMPL,
	"bms:14K": BMS_14K_IMPL,
	"bms:7K": BMS_7K_IMPL,
	"pms:Controller": PMS_IMPL,
	"pms:Keyboard": PMS_IMPL,
	"sdvx:Single": SDVX_IMPL,
	"usc:Controller": USC_IMPL,
	"usc:Keyboard": USC_IMPL,
};

export function GetEnumColour(score: ScoreDocument | PBScoreDocument, enumName: string) {
	const gptImpl = GPT_CLIENT_IMPLEMENTATIONS[GetGPTString(score.game, score.playtype)];

	// @ts-expect-error lol
	return gptImpl.enumColours[enumName][score.scoreData[enumName]];
}
