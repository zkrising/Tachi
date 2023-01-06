import {
	Game,
	GPTTierlists,
	GPTString,
	IIDX_LAMPS,
	ScoreDocument,
	SDVX_LAMPS,
	Playtype,
} from "tachi-common";

type ScaleAchievedFns = {
	[I in GPTString]: {
		[K in GPTTierlists[GPT]]: ((k: ScoreDocument<GPT>) => boolean) | null;
	};
};

const ScaleNameAchievedFns: ScaleAchievedFns = {
	"bms:14K": {
		"sgl-EC": (k) => k.scoreData.lamp.index >= IIDX_LAMPS.EASY_CLEAR,
		"sgl-HC": (k) => k.scoreData.lamp.index >= IIDX_LAMPS.HARD_CLEAR,
	},
	"bms:7K": {
		"sgl-EC": (k) => k.scoreData.lamp.index >= IIDX_LAMPS.EASY_CLEAR,
		"sgl-HC": (k) => k.scoreData.lamp.index >= IIDX_LAMPS.HARD_CLEAR,
	},
	"pms:Controller": {
		"sgl-EC": (k) => k.scoreData.lamp.index >= IIDX_LAMPS.EASY_CLEAR,
		"sgl-HC": (k) => k.scoreData.lamp.index >= IIDX_LAMPS.HARD_CLEAR,
	},
	"pms:Keyboard": {
		"sgl-EC": (k) => k.scoreData.lamp.index >= IIDX_LAMPS.EASY_CLEAR,
		"sgl-HC": (k) => k.scoreData.lamp.index >= IIDX_LAMPS.HARD_CLEAR,
	},
	"chunithm:Single": {},
	"gitadora:Dora": {},
	"gitadora:Gita": {},
	"iidx:DP": {
		"dp-tier": (k) => k.scoreData.lamp.index >= IIDX_LAMPS.CLEAR,
	},
	"iidx:SP": {
		"kt-NC": (k) => k.scoreData.lamp.index >= IIDX_LAMPS.CLEAR,
		"kt-HC": (k) => k.scoreData.lamp.index >= IIDX_LAMPS.HARD_CLEAR,
		"kt-EXHC": (k) => k.scoreData.lamp.index >= IIDX_LAMPS.EX_HARD_CLEAR,
	},
	"maimaidx:Single": {},
	"museca:Single": {
		"tachi-score": null,
	},
	"sdvx:Single": {
		clear: (k) => k.scoreData.lamp.index >= SDVX_LAMPS.CLEAR,
	},
	"usc:Controller": {},
	"usc:Keyboard": {},
	"wacca:Single": {},
	"popn:9B": {},
	"jubeat:Single": {},
	"itg:Stamina": {},
};

export function GetScaleAchievedFn(
	game: Game,
	playtype: Playtype,
	tierlist: GPTTierlists[GPTString]
) {
	const scl = ScaleNameAchievedFns[`${game}:${playtype}` as GPTString];

	if (!scl) {
		throw new Error(`Invalid game + pt combination ${game}:${playtype}. Can't find scale.`);
	}

	// @ts-expect-error hack haha
	return scl[tierlist];
}
