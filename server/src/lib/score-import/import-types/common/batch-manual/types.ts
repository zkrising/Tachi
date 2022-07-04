import type { Game, GPTSupportedVersions, IDStrings, Playtype } from "tachi-common";

export interface BatchManualContext {
	game: Game;
	playtype: Playtype;
	service: string;
	version: GPTSupportedVersions[IDStrings] | null;
}
