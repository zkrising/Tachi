import { Game, GPTTierlists, IDStrings, IIDX_LAMPS, ScoreDocument, SDVX_LAMPS } from "tachi-common";
import { Playtype } from "types/tachi";

type ScaleAchievedFns = {
	[I in IDStrings]: {
		[K in GPTTierlists[I]]: ((k: ScoreDocument<I>) => boolean) | null;
	};
};

const ScaleNameAchievedFns: ScaleAchievedFns = {
	"bms:14K": {
		"sgl-EC": k => k.scoreData.lampIndex >= IIDX_LAMPS.EASY_CLEAR,
		"sgl-HC": k => k.scoreData.lampIndex >= IIDX_LAMPS.HARD_CLEAR,
	},
	"bms:7K": {
		"sgl-EC": k => k.scoreData.lampIndex >= IIDX_LAMPS.EASY_CLEAR,
		"sgl-HC": k => k.scoreData.lampIndex >= IIDX_LAMPS.HARD_CLEAR,
	},
	"pms:Controller": {
		"sgl-EC": k => k.scoreData.lampIndex >= IIDX_LAMPS.EASY_CLEAR,
		"sgl-HC": k => k.scoreData.lampIndex >= IIDX_LAMPS.HARD_CLEAR,
	},
	"pms:Keyboard": {
		"sgl-EC": k => k.scoreData.lampIndex >= IIDX_LAMPS.EASY_CLEAR,
		"sgl-HC": k => k.scoreData.lampIndex >= IIDX_LAMPS.HARD_CLEAR,
	},
	"chunithm:Single": {},
	"ddr:DP": {},
	"ddr:SP": {},
	"gitadora:Dora": {},
	"gitadora:Gita": {},
	"iidx:DP": {},
	"iidx:SP": {
		"kt-NC": k => k.scoreData.lampIndex >= IIDX_LAMPS.CLEAR,
		"kt-HC": k => k.scoreData.lampIndex >= IIDX_LAMPS.HARD_CLEAR,
		"kt-EXHC": k => k.scoreData.lampIndex >= IIDX_LAMPS.EX_HARD_CLEAR,
	},
	"maimai:Single": {},
	"museca:Single": {
		"tachi-score": null,
	},
	"sdvx:Single": {
		clear: k => k.scoreData.lampIndex >= SDVX_LAMPS.CLEAR,
	},
	"usc:Controller": {},
	"usc:Keyboard": {},
	"wacca:Single": {},
	"popn:9B": {},
	"jubeat:Single": {},
};

export function GetScaleAchievedFn(
	game: Game,
	playtype: Playtype,
	tierlist: GPTTierlists[IDStrings]
) {
	const scl = ScaleNameAchievedFns[`${game}:${playtype}` as IDStrings];

	if (!scl) {
		throw new Error(`Invalid game + pt combination ${game}:${playtype}. Can't find scale.`);
	}

	// @ts-expect-error hack haha
	return scl[tierlist];
}
