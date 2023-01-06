import type { Game, GPTSupportedVersions, GPTString, Playtype } from "tachi-common";

export interface BatchManualContext {
	game: Game;
	playtype: Playtype;
	service: string;
	version: GPTSupportedVersions[GPTString] | null;
}
