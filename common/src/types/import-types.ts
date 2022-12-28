export type FileUploadImportTypes =
	| "file/batch-manual"
	| "file/eamusement-iidx-csv"
	| "file/eamusement-sdvx-csv"
	| "file/mer-iidx"
	| "file/mypagescraper-player-csv"
	| "file/mypagescraper-records-csv"
	| "file/pli-iidx-csv"
	| "file/solid-state-squad";

export type APIImportTypes =
	| "api/eag-iidx"
	| "api/eag-sdvx"
	| "api/flo-iidx"
	| "api/flo-sdvx"
	| "api/min-sdvx"

	// cg has dev and prod supported
	// with four games.
	// this typescript feature for stringliteral expansion is kinda neat.
	| `api/cg-${"dev" | "prod"}-${"museca" | "popn" | "sdvx"}`;

export type IRImportTypes =
	| "ir/barbatos"
	| "ir/beatoraja"
	| "ir/direct-manual"
	| "ir/fervidex-static"
	| "ir/fervidex"
	| "ir/kshook-sv6c-static"
	| "ir/kshook-sv6c"
	| "ir/lr2hook"
	| "ir/usc";

export type ImportTypes = APIImportTypes | FileUploadImportTypes | IRImportTypes;
