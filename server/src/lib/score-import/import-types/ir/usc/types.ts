import { Playtypes } from "tachi-common";

export interface IRUSCContext {
	chartHash: string;
	playtype: Playtypes["usc"];
	timeReceived: number;
}
