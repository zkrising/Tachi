import type {
	APIImportTypes,
	FileUploadImportTypes,
	IRImportTypes,
	ImportTypes,
} from "../types/import-types";

export const fileImportTypes: Array<FileUploadImportTypes> = [
	"file/eamusement-iidx-csv",
	"file/eamusement-sdvx-csv",
	"file/batch-manual",
	"file/solid-state-squad",
	"file/mer-iidx",
	"file/pli-iidx-csv",
	"file/mypagescraper-records-csv",
	"file/mypagescraper-player-csv",
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
