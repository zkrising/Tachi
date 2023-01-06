import type { Game, Versions, GPTString, Playtype } from "tachi-common";

export interface BatchManualContext {
	game: Game;
	playtype: Playtype;
	service: string;
	version: Versions[GPTString] | null;
}
