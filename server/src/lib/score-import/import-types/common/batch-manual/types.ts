import { Game, Playtypes, IDStrings, GPTSupportedVersions } from "tachi-common";

export interface BatchManualContext {
	game: Game;
	playtype: Playtypes[Game];
	service: string;
	version: GPTSupportedVersions[IDStrings] | null;
}
