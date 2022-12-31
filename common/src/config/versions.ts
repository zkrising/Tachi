import { GetGameConfig } from "./old-config";
import type { IDStrings, GPTSupportedVersions, Game, Playtype } from "../types";

export type Versions = {
	[I in IDStrings]: {
		[K in GPTSupportedVersions[I]]: string;
	};
};

const prettyGitadoraVersions: Versions["gitadora:Dora"] = {
	konaste: "Konaste",
};

// WHEN YOU UPDATE THIS, **MAKE SURE** YOU UPDATE CONFIG.TS ACCORDINGLY.
export const PrettyVersions: Versions = {
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
