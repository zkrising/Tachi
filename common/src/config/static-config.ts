import { GetGameConfig } from "..";
import type {
	FileUploadImportTypes,
	IRImportTypes,
	APIImportTypes,
	ImportTypes,
	Game,
	IDStrings,
	GPTSupportedVersions,
	Playtype,
} from "..";

export const fileImportTypes: Array<FileUploadImportTypes> = [
	"file/eamusement-iidx-csv",
	"file/eamusement-sdvx-csv",
	"file/batch-manual",
	"file/solid-state-squad",
	"file/mer-iidx",
	"file/pli-iidx-csv",
];

export const irImportTypes: Array<IRImportTypes> = [
	"ir/direct-manual",
	"ir/barbatos",
	"ir/fervidex",
	"ir/fervidex-static",
	"ir/beatoraja",
	"ir/usc",
	"ir/kshook-sv6c",
];

export const apiImportTypes: Array<APIImportTypes> = [
	"api/arc-iidx",
	"api/arc-sdvx",
	"api/eag-iidx",
	"api/eag-sdvx",
	"api/flo-iidx",
	"api/flo-sdvx",
	"api/min-sdvx",
];

export const allImportTypes: Array<ImportTypes> = [
	...fileImportTypes,
	...irImportTypes,
	...apiImportTypes,
];

export const allIDStrings: Array<IDStrings> = [
	"iidx:SP",
	"bms:14K",
	"bms:7K",
	"chunithm:Single",

	// "ddr:DP",
	// "ddr:SP",
	// "gitadora:Dora",
	// "gitadora:Gita", <- none of these are actually supported

	"iidx:DP",
	"maimai:Single",
	"museca:Single",
	"sdvx:Single",
	"usc:Controller",
	"usc:Keyboard",
	"wacca:Single",
	"pms:Controller",
	"pms:Keyboard",
	"jubeat:Single",
	"itg:Stamina",
];

export const allSupportedGames: Array<Game> = [
	"iidx",
	"museca",
	"maimai",
	"jubeat",
	"popn",
	"sdvx",
	"ddr",
	"bms",
	"chunithm",
	"gitadora",
	"usc",
	"wacca",
	"pms",
	"itg",
];
