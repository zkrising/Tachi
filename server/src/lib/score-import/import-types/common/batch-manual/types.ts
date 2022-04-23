import { Game, GPTSupportedVersions, IDStrings, Playtype, Playtypes } from "tachi-common";

export interface BatchManualContext {
	game: Game;
	playtype: Playtype;
	service: string;
	version: GPTSupportedVersions[IDStrings] | null;
}
