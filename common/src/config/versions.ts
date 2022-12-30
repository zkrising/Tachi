import { GetGameConfig } from "./old-config";
import type { IDStrings, GPTSupportedVersions, Game, Playtype } from "../types";

export type Versions = {
	[I in IDStrings]: {
		[K in GPTSupportedVersions[I]]: string;
	};
};

const prettyIIDXVersions: Versions["iidx:SP"] = {
	20: "tricoro",
	21: "SPADA",
	22: "PENDUAL",
	23: "copula",
	24: "SINOBUZ",
	25: "CANNON BALLERS",
	26: "ROOTAGE",
	27: "HEROIC VERSE",
	28: "BISTROVER",
	29: "CastHour",
	30: "Resident",
	"10-cs": "10th Style CS",
	"11-cs": "IIDX RED CS",
	"12-cs": "HAPPY SKY CS",
	"13-cs": "DISTORTED CS",
	"14-cs": "GOLD CS",
	"15-cs": "DJ TROOPERS CS",
	"16-cs": "EMPRESS CS",
	"26-omni": "ROOTAGE Omnimix",
	"3-cs": "3rd Style CS",
	"4-cs": "4th Style CS",
	"5-cs": "5th Style CS",
	"6-cs": "6th Style CS",
	"7-cs": "7th Style CS",
	"8-cs": "8th Style CS",
	"9-cs": "9th Style CS",
	"27-omni": "HEROIC VERSE Omnimix",
	"28-omni": "BISTROVER Omnimix",
	"29-omni": "CastHour Omnimix",
	"27-2dxtra": "HEROIC VERSE 2dxtra",
	"28-2dxtra": "BISTROVER 2dxtra",
	bmus: "BEATMANIA US",
	inf: "INFINITAS",
};

const prettyGitadoraVersions: Versions["gitadora:Dora"] = {
	konaste: "Konaste",
};

// WHEN YOU UPDATE THIS, **MAKE SURE** YOU UPDATE CONFIG.TS ACCORDINGLY.
export const PrettyVersions: Versions = {
	"iidx:SP": prettyIIDXVersions,
	"iidx:DP": prettyIIDXVersions,
	"popn:9B": { peace: "peace", kaimei: "Kaimei Riddles" },
	"bms:7K": {},
	"bms:14K": {},
	"chunithm:Single": {
		paradiselost: "Paradise Lost",
	},
	"gitadora:Gita": prettyGitadoraVersions,
	"gitadora:Dora": prettyGitadoraVersions,
	"museca:Single": {
		1.5: "1 + 1/2",
		"1.5-b": "1 + 1/2 Rev. B",
	},
	"sdvx:Single": {
		booth: "BOOTH",
		inf: "Infinite Infection",
		gw: "GRAVITY WARS",
		heaven: "HEAVENLY HAVEN",
		vivid: "VIVID WAVE",
		exceed: "EXCEED GEAR",
		konaste: "Konaste",
	},
	"usc:Keyboard": {},
	"usc:Controller": {},
	"wacca:Single": {
		reverse: "REVERSE",
	},
	"jubeat:Single": {
		festo: "festo",
		clan: "clan",
		qubell: "Qubell",
		saucer: "saucer",
		prop: "prop",
		copious: "copious",
		knit: "knit",
		ripples: "ripples",
		jubeat: "jubeat",
	},
	"pms:Controller": {},
	"pms:Keyboard": {},
	"itg:Stamina": {},
	"maimaidx:Single": {
		universeplus: "UNiVERSE PLUS",
	},
};

export function PrettyFormatGameVersion<I extends IDStrings>(
	idString: I,
	version: GPTSupportedVersions[I]
) {
	// lol
	const [game] = idString.split(":") as [Game, Playtype];

	const ver = PrettyVersions[idString][version];

	const gameConfig = GetGameConfig(game);

	return `${gameConfig.name} (${ver})`;
}
