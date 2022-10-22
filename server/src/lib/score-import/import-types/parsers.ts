import { ParseArcIIDX } from "./api/arc-iidx/parser";
import { ParseArcSDVX } from "./api/arc-sdvx/parser";
import { ParseEagIIDX } from "./api/eag-iidx/parser";
import { ParseEagSDVX } from "./api/eag-sdvx/parser";
import { ParseFloIIDX } from "./api/flo-iidx/parser";
import { ParseFloSDVX } from "./api/flo-sdvx/parser";
import { ParseMinSDVX } from "./api/min-sdvx/parser";
import ParseBatchManual from "./file/batch-manual/parser";
import ParseEamusementIIDXCSV from "./file/eamusement-iidx-csv/parser";
import ParseEamusementSDVXCSV from "./file/eamusement-sdvx-csv/parser";
import { ParseMerIIDX } from "./file/mer-iidx/parser";
import ParsePLIIIDXCSV from "./file/pli-iidx-csv/parser";
import { ParseSolidStateXML } from "./file/solid-state-squad/parser";
import { ParseBarbatosSingle } from "./ir/barbatos/parser";
import { ParseBeatorajaSingle } from "./ir/beatoraja/parser";
import ParseDirectManual from "./ir/direct-manual/parser";
import { ParseFervidexStatic } from "./ir/fervidex-static/parser";
import { ParseFervidexSingle } from "./ir/fervidex/parser";
import { ParseKsHookSV6CStatic } from "./ir/kshook-sv6c-static/parser";
import { ParseKsHookSV6C } from "./ir/kshook-sv6c/parser";
import { ParseLR2Hook } from "./ir/lr2hook/parser";
import { ParseIRUSC } from "./ir/usc/parser";

export const Parsers = {
	"file/solid-state-squad": ParseSolidStateXML,
	"file/batch-manual": ParseBatchManual,
	"file/mer-iidx": ParseMerIIDX,
	"file/pli-iidx-csv": ParsePLIIIDXCSV,
	"file/eamusement-iidx-csv": ParseEamusementIIDXCSV,
	"file/eamusement-sdvx-csv": ParseEamusementSDVXCSV,

	"api/eag-iidx": ParseEagIIDX,
	"api/eag-sdvx": ParseEagSDVX,
	"api/flo-iidx": ParseFloIIDX,
	"api/flo-sdvx": ParseFloSDVX,
	"api/min-sdvx": ParseMinSDVX,
	"api/arc-iidx": ParseArcIIDX,
	"api/arc-sdvx": ParseArcSDVX,

	"ir/barbatos": ParseBarbatosSingle,
	"ir/beatoraja": ParseBeatorajaSingle,
	"ir/fervidex": ParseFervidexSingle,
	"ir/fervidex-static": ParseFervidexStatic,
	"ir/direct-manual": ParseDirectManual,
	"ir/usc": ParseIRUSC,
	"ir/kshook-sv6c": ParseKsHookSV6C,
	"ir/kshook-sv6c-static": ParseKsHookSV6CStatic,
	"ir/lr2hook": ParseLR2Hook,
};
