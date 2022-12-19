import { Game, GetIDString, IDStrings, Playtype } from "tachi-common";
import { GPTToolOrInsight } from "types/ugpt";
import { BMSCustomTablesTool } from "./tools/BMSCustomTablesTool";
import { IIDXEamusementExportTool } from "./tools/IIDXEamusementExportTool";
import { IIDXPlaylistsTool } from "./tools/IIDXPlaylistsTool";
import { JubilityBreakdownInsight } from "./insights/JubilityBreakdownInsight";

// A tool is something that users can use, like exporting to a specific format
// or having things integrate with the game in a neat way.
// Tools are **NOT** displayed on someone elses profile. For that, you want
// Insights (Fancy score renderers, basically).

// What tools does each game support?
const GPT_TOOLS: Record<IDStrings, Array<GPTToolOrInsight>> = {
	"bms:7K": [BMSCustomTablesTool],
	"bms:14K": [BMSCustomTablesTool],
	"chunithm:Single": [],
	"gitadora:Dora": [],
	"gitadora:Gita": [],
	"iidx:DP": [IIDXEamusementExportTool, IIDXPlaylistsTool],
	"iidx:SP": [IIDXEamusementExportTool, IIDXPlaylistsTool],
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

// An insight is a page for a unique kind of data viz that tachi (generically) does not
// pick up. Good examples of this would be something like viewing what goes into your
// jubility.
const GPT_INSIGHTS: Record<IDStrings, Array<GPTToolOrInsight>> = {
	"bms:7K": [],
	"bms:14K": [],
	"chunithm:Single": [],
	"gitadora:Dora": [],
	"gitadora:Gita": [],
	"iidx:DP": [],
	"iidx:SP": [],
	"itg:Stamina": [],
	"jubeat:Single": [JubilityBreakdownInsight],
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

export function GetGPTInsights(game: Game, playtype: Playtype) {
	const idString = GetIDString(game, playtype);

	return GPT_INSIGHTS[idString];
}
