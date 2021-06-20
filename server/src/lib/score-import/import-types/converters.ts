import { ImportTypes } from "tachi-common";
import { ConvertAPIArcDDR } from "./api/arc-ddr/converter";
import { ConvertAPIArcIIDX } from "./api/arc-iidx/converter";
import { ConvertAPIArcSDVX } from "./api/arc-sdvx/converter";
import { ConvertAPIKaiIIDX } from "./common/api-kai/iidx/converter";
import { ConvertAPIKaiSDVX } from "./common/api-kai/sdvx/converter";
import { ConverterBatchManual } from "./common/batch-manual/converter";
import ConvertEamIIDXCSV from "./common/eamusement-iidx-csv/converter";
import { ConverterFunction, ImportTypeContextMap, ImportTypeDataMap } from "./common/types";
import { ConvertFileMerIIDX } from "./file/mer-iidx/converter";
import { ConvertFileS3 } from "./file/solid-state-squad/converter";
import { ConverterIRBarbatos } from "./ir/barbatos/converter";
import { ConverterIRBeatoraja } from "./ir/beatoraja/converter";
import { ConverterIRFervidexStatic } from "./ir/fervidex-static/converter";
import { ConverterIRFervidex } from "./ir/fervidex/converter";
import { ConverterIRUSC } from "./ir/usc/converter";

export type ConverterMap = {
	[I in ImportTypes]: ConverterFunction<ImportTypeDataMap[I], ImportTypeContextMap[I]>;
};

export const Converters: ConverterMap = {
	"file/solid-state-squad": ConvertFileS3,
	"file/batch-manual": ConverterBatchManual,
	"file/mer-iidx": ConvertFileMerIIDX,
	"file/pli-iidx-csv": ConvertEamIIDXCSV,
	"file/eamusement-iidx-csv": ConvertEamIIDXCSV,

	"api/eag-iidx": ConvertAPIKaiIIDX,
	"api/eag-sdvx": ConvertAPIKaiSDVX,
	"api/flo-iidx": ConvertAPIKaiIIDX,
	"api/flo-sdvx": ConvertAPIKaiSDVX,
	"api/arc-iidx": ConvertAPIArcIIDX,
	"api/arc-ddr": ConvertAPIArcDDR,
	"api/arc-sdvx": ConvertAPIArcSDVX,

	"ir/barbatos": ConverterIRBarbatos,
	"ir/beatoraja": ConverterIRBeatoraja,
	"ir/fervidex": ConverterIRFervidex,
	"ir/fervidex-static": ConverterIRFervidexStatic,
	"ir/direct-manual": ConverterBatchManual,
	"ir/usc": ConverterIRUSC,
	"ir/chunitachi": ConverterBatchManual,
};
