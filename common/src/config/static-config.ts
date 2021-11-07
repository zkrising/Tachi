import {
	FileUploadImportTypes,
	IRImportTypes,
	APIImportTypes,
	ImportTypes,
	Game,
	IDStrings,
	GPTSupportedVersions,
} from "..";

export const fileImportTypes: FileUploadImportTypes[] = [
	"file/eamusement-iidx-csv",
	"file/batch-manual",
	"file/solid-state-squad",
	"file/mer-iidx",
	"file/pli-iidx-csv",
];

export const irImportTypes: IRImportTypes[] = [
	"ir/direct-manual",
	"ir/barbatos",
	"ir/fervidex",
	"ir/fervidex-static",
	"ir/beatoraja",
	"ir/chunitachi",
	"ir/usc",
	"ir/kshook-sv3c",
];

export const apiImportTypes: APIImportTypes[] = [
	"api/arc-iidx",
	"api/arc-sdvx",
	"api/eag-iidx",
	"api/eag-sdvx",
	"api/flo-iidx",
	"api/flo-sdvx",
	"api/min-sdvx",
];

export const allImportTypes: ImportTypes[] = [
	...fileImportTypes,
	...irImportTypes,
	...apiImportTypes,
];

export const allIDStrings: IDStrings[] = [
	"iidx:SP",
	"bms:14K",
	"bms:7K",
	"chunithm:Single",
	"ddr:DP",
	"ddr:SP",
	"gitadora:Dora",
	"gitadora:Gita",
	"iidx:DP",
	"maimai:Single",
	"museca:Single",
	"sdvx:Single",
	"usc:Single",
];

export const allSupportedGames: Game[] = [
	"iidx",
	"museca",
	"maimai",
	// "jubeat",
	// "popn",
	"sdvx",
	"ddr",
	"bms",
	"chunithm",
	// "gitadora",
	"usc",
];

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
	"27-2dxtra": "HEROIC VERSE 2dxtra",
	bmus: "BEATMANIA US",
	inf: "INFINITAS",
};

const prettyDDRVersions: Versions["ddr:SP"] = {
	a20: "A20",
};

const prettyGitadoraVersions: Versions["gitadora:Dora"] = {
	nextage: "NEX+AGE",
};

export const PrettyVersions: Versions = {
	"iidx:SP": prettyIIDXVersions,
	"iidx:DP": prettyIIDXVersions,
	"bms:7K": {},
	"bms:14K": {},
	"chunithm:Single": {
		paradise: "Paradise",
	},
	"ddr:SP": prettyDDRVersions,
	"ddr:DP": prettyDDRVersions,
	"gitadora:Gita": prettyGitadoraVersions,
	"gitadora:Dora": prettyGitadoraVersions,
	"maimai:Single": {
		finale: "FiNALE",
	},
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
		konaste: "Konaste",
	},
	"usc:Single": {},
};
