import type { ConverterFailure } from "../../framework/common/converter-failures";
import type { DryScore } from "../../framework/common/types";
import type { ClassHandler } from "../../framework/user-game-stats/types";
import type { SDVXEamusementCSVData } from "../file/eamusement-sdvx-csv/types";
import type { MerScore } from "../file/mer-iidx/types";
import type { S3Score } from "../file/solid-state-squad/types";
import type { BarbatosContext, BarbatosScore, BarbatosSDVX6Score } from "../ir/barbatos/types";
import type { BeatorajaContext, BeatorajaScore } from "../ir/beatoraja/types";
import type { FervidexStaticContext, FervidexStaticScore } from "../ir/fervidex-static/types";
import type { FervidexContext, FervidexScore } from "../ir/fervidex/types";
import type { KsHookSV6CStaticScore } from "../ir/kshook-sv6c-static/types";
import type { KsHookSV6CContext, KsHookSV6CScore } from "../ir/kshook-sv6c/types";
import type { LR2HookContext, LR2HookScore } from "../ir/lr2hook/types";
import type { IRUSCContext } from "../ir/usc/types";
import type { KaiContext } from "./api-kai/types";
import type { BatchManualContext } from "./batch-manual/types";
import type { IIDXEamusementCSVContext, IIDXEamusementCSVData } from "./eamusement-iidx-csv/types";
import type { KtLogger } from "lib/logger/logger";
import type { USCClientScore } from "server/router/ir/usc/_playtype/types";
import type {
	BatchManualScore,
	ChartDocument,
	Game,
	ImportTypes,
	integer,
	MongoDBDocument,
	SongDocument,
} from "tachi-common";
import type { EmptyObject } from "utils/types";

export interface ImportTypeDataMap {
	"file/eamusement-iidx-csv": IIDXEamusementCSVData;
	"file/eamusement-sdvx-csv": SDVXEamusementCSVData;
	"file/batch-manual": BatchManualScore;
	"file/solid-state-squad": S3Score;
	"file/mer-iidx": MerScore;
	"file/pli-iidx-csv": IIDXEamusementCSVData;

	"ir/direct-manual": BatchManualScore;
	"ir/barbatos": BarbatosScore | BarbatosSDVX6Score;
	"ir/fervidex": FervidexScore;
	"ir/fervidex-static": FervidexStaticScore;
	"ir/beatoraja": BeatorajaScore;
	"ir/usc": USCClientScore;
	"ir/kshook-sv6c": KsHookSV6CScore;
	"ir/kshook-sv6c-static": KsHookSV6CStaticScore;
	"ir/lr2hook": LR2HookScore;

	// These aren't placeholder values - the data is yielded in a way that
	// the value of these is legitimately unknown at convert time.
	"api/arc-iidx": unknown;
	"api/arc-sdvx": unknown;
	"api/flo-iidx": unknown;
	"api/flo-sdvx": unknown;
	"api/min-sdvx": unknown;
	"api/eag-iidx": unknown;
	"api/eag-sdvx": unknown;
}

export interface ImportTypeContextMap {
	"file/eamusement-iidx-csv": IIDXEamusementCSVContext;
	"file/eamusement-sdvx-csv": EmptyObject;
	"file/batch-manual": BatchManualContext;
	"file/solid-state-squad": EmptyObject;
	"file/mer-iidx": EmptyObject;
	"file/pli-iidx-csv": IIDXEamusementCSVContext;

	"ir/direct-manual": BatchManualContext;
	"ir/barbatos": BarbatosContext;
	"ir/fervidex": FervidexContext;
	"ir/fervidex-static": FervidexStaticContext;
	"ir/beatoraja": BeatorajaContext;
	"ir/usc": IRUSCContext;
	"ir/kshook-sv6c": KsHookSV6CContext;
	"ir/kshook-sv6c-static": EmptyObject;
	"ir/lr2hook": LR2HookContext;

	"api/arc-iidx": EmptyObject;
	"api/arc-sdvx": EmptyObject;
	"api/flo-iidx": KaiContext;
	"api/flo-sdvx": KaiContext;
	"api/min-sdvx": KaiContext;
	"api/eag-iidx": KaiContext;
	"api/eag-sdvx": KaiContext;
}

export interface OrphanScoreDocument<T extends ImportTypes = ImportTypes> extends MongoDBDocument {
	importType: T;
	data: ImportTypeDataMap[T];
	context: ImportTypeContextMap[T];
	errMsg: string | null;
	orphanID: string;
	userID: integer;
	timeInserted: number;
	game: Game;
}

export interface ConverterFnSuccessReturn {
	dryScore: DryScore;
	chart: ChartDocument;
	song: SongDocument;
}

export type ConverterFnReturnOrFailure = ConverterFailure | ConverterFnSuccessReturn;

export type ConverterFunction<D, C> = (
	data: D,
	processContext: C,
	importType: ImportTypes,
	logger: KtLogger
) => Promise<ConverterFnSuccessReturn>;

export type ImportInputParser<D, C> = (
	logger: KtLogger
) => ParserFunctionReturns<D, C> | Promise<ParserFunctionReturns<D, C>>;

export interface ParserFunctionReturns<D, C> {
	iterable: AsyncIterable<D> | Iterable<D>;
	context: C;
	game: Game;
	classHandler: ClassHandler | null;
}

export type ParserFunction<D, C, A extends Array<unknown>> = (
	...args: A
) => ParserFunctionReturns<D, C>;
