import { FileUploadImportTypes, IRImportTypes, APIImportTypes, ImportTypes, Game } from "..";
import { GetGameConfig } from "./config";

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
];

export const apiImportTypes: APIImportTypes[] = [
	"api/arc-iidx",
	"api/arc-sdvx",
	"api/arc-ddr",
	"api/eag-iidx",
	"api/eag-sdvx",
	"api/flo-iidx",
	"api/flo-sdvx",
];

export const allImportTypes: ImportTypes[] = [
	...fileImportTypes,
	...irImportTypes,
	...apiImportTypes,
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
	"gitadora",
	"usc",
];

export interface ServerConfig {
	name: string;
	supportedGames: Game[];
	supportedImportTypes: ImportTypes[];
}

export const KTCHI_CONFIG: ServerConfig = {
	name: "Kamaitachi",
	supportedGames: ["iidx", "gitadora", "chunithm", "maimai", "museca", "sdvx"],
	supportedImportTypes: [
		"api/arc-iidx",
		"api/arc-sdvx",
		"api/arc-ddr",
		"api/eag-iidx",
		"api/eag-sdvx",
		"api/flo-iidx",
		"api/flo-sdvx",
		"ir/direct-manual",
		"ir/fervidex",
		"ir/fervidex-static",
		"ir/chunitachi",
		"file/eamusement-iidx-csv",
		"file/solid-state-squad",
		"file/mer-iidx",
		"file/pli-iidx-csv",
	],
};

export const BTCHI_CONFIG: ServerConfig = {
	name: "Bokutachi",
	supportedGames: ["usc", "bms"],
	supportedImportTypes: ["ir/beatoraja", "ir/usc", "ir/direct-manual", "file/batch-manual"],
};

export const OMNI_CONFIG: ServerConfig = {
	name: "Omnitachi",
	supportedGames: allSupportedGames,
	supportedImportTypes: allImportTypes,
};

export function FormatGame(game: Game, playtype: Playtypes[Game]): string {
	const gameConfig = GetGameConfig(game);

	if (gameConfig.validPlaytypes.length === 1) {
		return gameConfig.name;
	}

	return `${gameConfig.name} (${playtype})`;
}
