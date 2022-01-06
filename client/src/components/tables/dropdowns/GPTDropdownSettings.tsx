import { Game } from "tachi-common";
import { Playtype } from "types/tachi";
import { IIDXGraphsComponent } from "./components/IIDXScoreDropdownParts";

export function GPTDropdownSettings(game: Game, playtype: Playtype): any {
	if (game === "iidx") {
		return {
			renderScoreInfo: false,
			// let the record show that i tried fixing this
			// for a while, but gave up.
			GraphComponent: IIDXGraphsComponent as any,
		};
	}

	return {};
}
