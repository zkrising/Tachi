import { Game, GetIDString, IDStrings, Playtype } from "tachi-common";
import { GPTTool } from "types/ugpt";
import { BMSCustomTablesTool } from "./BMSCustomTablesTool";
import { IIDXEamusementExportTool } from "./IIDXEamusementExportTool";

// A tool is something that users can use, like exporting to a specific format
// or having things integrate with the game in a neat way.
// Tools are **NOT** displayed on someone elses profile. For that, you want
// Insights (Fancy score renderers, basically).

// What tools does each game support?
const GPT_TOOLS: Record<IDStrings, Array<GPTTool>> = {
	"bms:7K": [BMSCustomTablesTool],
	"bms:14K": [BMSCustomTablesTool],
	"chunithm:Single": [],
	"gitadora:Dora": [],
	"gitadora:Gita": [],
	"iidx:DP": [IIDXEamusementExportTool],
	"iidx:SP": [IIDXEamusementExportTool],
	"itg:Stamina": [],
	"jubeat:Single": [],
	"museca:Single": [],
	"pms:Controller": [],
	"pms:Keyboard": [],
	"popn:9B": [],
	"sdvx:Single": [],
	"usc:Controller": [],
	"usc:Keyboard": [],
	"wacca:Single": [],
};

export function GetGPTTools(game: Game, playtype: Playtype) {
	const idString = GetIDString(game, playtype);

	return GPT_TOOLS[idString];
}
