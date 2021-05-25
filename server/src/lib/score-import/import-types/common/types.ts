import { EmptyObject, KtLogger } from "../../../../utils/types";
import { MerScore } from "../file/mer-iidx/types";
import { S3Score } from "../file/solid-state-squad/types";
import { BarbatosScore } from "../ir/barbatos/types";
import { FervidexStaticContext, FervidexStaticScore } from "../ir/fervidex-static/types";
import { FervidexContext, FervidexScore } from "../ir/fervidex/types";
import { KaiContext } from "./api-kai/types";
import { BatchManualContext, BatchManualScore } from "./batch-manual/types";
import { IIDXEamusementCSVContext, IIDXEamusementCSVData } from "./eamusement-iidx-csv/types";
import { ImportTypes, Game, AnyChartDocument, AnySongDocument } from "kamaitachi-common";
import { ConverterFailure } from "../../framework/common/converter-failures";
import { ClassHandler } from "../../framework/user-game-stats/classes";
import { DryScore } from "../../framework/common/types";

export interface ImportTypeDataMap {
    "file/eamusement-iidx-csv": IIDXEamusementCSVData;
    "file/batch-manual": BatchManualScore;
    "file/solid-state-squad": S3Score;
    "file/mer-iidx": MerScore;
    "file/pli-iidx-csv": IIDXEamusementCSVData;

    "ir/direct-manual": BatchManualScore;
    "ir/barbatos": BarbatosScore;
    "ir/fervidex": FervidexScore;
    "ir/fervidex-static": FervidexStaticScore;
    "ir/chunitachi": BatchManualScore;
    "ir/beatoraja": EmptyObject;
    "ir/usc": EmptyObject;

    "api/arc-iidx": unknown;
    "api/arc-sdvx": unknown;
    "api/arc-jubeat": unknown;
    "api/flo-iidx": unknown;
    "api/flo-sdvx": unknown;
    "api/eag-iidx": unknown;
    "api/eag-sdvx": unknown;
}

export interface ImportTypeContextMap {
    "file/eamusement-iidx-csv": IIDXEamusementCSVContext;
    "file/batch-manual": BatchManualContext;
    "file/solid-state-squad": EmptyObject;
    "file/mer-iidx": EmptyObject;
    "file/pli-iidx-csv": EmptyObject;

    "ir/direct-manual": BatchManualContext;
    "ir/barbatos": EmptyObject;
    "ir/fervidex": FervidexContext;
    "ir/fervidex-static": FervidexStaticContext;
    "ir/chunitachi": BatchManualContext;
    "ir/beatoraja": EmptyObject;
    "ir/usc": EmptyObject;

    "api/arc-iidx": EmptyObject;
    "api/arc-sdvx": EmptyObject;
    "api/arc-jubeat": EmptyObject;
    "api/flo-iidx": KaiContext;
    "api/flo-sdvx": KaiContext;
    "api/eag-iidx": KaiContext;
    "api/eag-sdvx": KaiContext;
}
export interface OrphanedScore<T extends ImportTypes> {
    importType: T;
    data: ImportTypeDataMap[T];
    converterContext: ImportTypeContextMap[T];
    humanisedIdentifier: string;
}

export interface ConverterFnSuccessReturn {
    dryScore: DryScore;
    chart: AnyChartDocument;
    song: AnySongDocument;
}

export type ConverterFnReturn = ConverterFailure | ConverterFnSuccessReturn | null;

export type ConverterFunctionReturns = ConverterFnReturn | ConverterFnReturn[];

export interface ConverterFunction<D, C> {
    (
        data: D,
        processContext: C,
        importType: ImportTypes,
        logger: KtLogger
    ): Promise<ConverterFunctionReturns>;
}

export interface ImportInputParser<D, C> {
    (logger: KtLogger): ParserFunctionReturns<D, C> | Promise<ParserFunctionReturns<D, C>>;
}

export type ParserFunctionReturns<D, C> =
    | ParserFunctionReturnsAsync<D, C>
    | ParserFunctionReturnsSync<D, C>;

export interface ParserFunctionReturnsAsync<D, C> {
    iterable: AsyncIterable<D>;
    context: C;
    game: Game;
    ConverterFunction: ConverterFunction<D, C>;
    classHandler: ClassHandler | null;
}

export interface ParserFunctionReturnsSync<D, C> {
    iterable: Iterable<D>;
    context: C;
    game: Game;
    ConverterFunction: ConverterFunction<D, C>;
    classHandler: ClassHandler | null;
}
