import type {
	APIImportTypes,
	FileUploadImportTypes,
	Game,
	IDStrings,
	IRImportTypes,
	ImportTypes,
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
	"api/eag-iidx",
	"api/eag-sdvx",
	"api/flo-iidx",
	"api/flo-sdvx",
	"api/min-sdvx",
	"api/cg-dev-museca",
	"api/cg-dev-popn",
	"api/cg-dev-sdvx",
	"api/cg-prod-museca",
	"api/cg-prod-popn",
	"api/cg-prod-sdvx",
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
	"gitadora:Dora",
	"gitadora:Gita",
	"iidx:DP",
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
	"jubeat",
	"popn",
	"sdvx",
	"bms",
	"chunithm",
	"gitadora",
	"usc",
	"wacca",
	"pms",
	"itg",
];
