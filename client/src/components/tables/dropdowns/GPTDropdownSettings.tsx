import { Game, Playtype } from "tachi-common";
import { BMSGraphsComponent } from "./components/BMSScoreDropdownParts";
import { IIDXGraphsComponent } from "./components/IIDXScoreDropdownParts";
import { ITGGraphsComponent } from "./components/ITGScoreDropdownParts";
import { JubeatGraphsComponent } from "./components/JubeatScoreDropdownParts";
import { OngekiGraphsComponent } from "./components/OngekiScoreDropdownParts";
import { ChunithmGraphsComponent } from "./components/ChunithmScoreDropdownParts";
import { MaimaiDXGraphsComponent } from "./components/MaimaiDXScoreDropdownParts";

export function GPTDropdownSettings(game: Game, playtype: Playtype): any {
	if (game === "iidx") {
		return {
			renderScoreInfo: true,
			// let the record show that i tried fixing this
			// for a while, but gave up.
			GraphComponent: IIDXGraphsComponent as any,
		};
	} else if (game === "bms") {
		return {
			renderScoreInfo: true,
			GraphComponent: BMSGraphsComponent as any,
		};
	} else if (game === "itg") {
		return {
			renderScoreInfo: true,
			GraphComponent: ITGGraphsComponent as any,
		};
	} else if (game === "jubeat") {
		return {
			renderScoreInfo: true,
			GraphComponent: JubeatGraphsComponent as any,
		};
	} else if (game === "ongeki") {
		return {
			renderScoreInfo: true,
			GraphComponent: OngekiGraphsComponent as any,
		};
	} else if (game === "chunithm") {
		return {
			renderScoreInfo: true,
			GraphComponent: ChunithmGraphsComponent as any,
		};
	} else if (game === "maimaidx") {
		return {
			renderScoreInfo: true,
			GraphComponent: MaimaiDXGraphsComponent as any,
		};
	}

	return {};
}
