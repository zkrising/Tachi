import { EmptyObject } from "../../../../utils/types";
import { KtLogger } from "../../../logger/logger";
import { MerScore } from "../file/mer-iidx/types";
import { S3Score } from "../file/solid-state-squad/types";
import { BarbatosScore } from "../ir/barbatos/types";
import { FervidexStaticContext, FervidexStaticScore } from "../ir/fervidex-static/types";
import { FervidexContext, FervidexScore } from "../ir/fervidex/types";
import { KaiContext } from "./api-kai/types";
import { BatchManualContext, BatchManualScore } from "./batch-manual/types";
import { IIDXEamusementCSVContext, IIDXEamusementCSVData } from "./eamusement-iidx-csv/types";
import {
    ImportTypes,
    Game,
    AnyChartDocument,
    AnySongDocument,
    integer,
    MongoDBDocument,
} from "kamaitachi-common";
import { ConverterFailure } from "../../framework/common/converter-failures";
import { ClassHandler } from "../../framework/user-game-stats/classes";
import { DryScore } from "../../framework/common/types";
import { BeatorajaContext, BeatorajaScore } from "../ir/beatoraja/types";
import { USCClientScore } from "../../../../server/router/ir/usc/usc";
import { IRUSCContext } from "../ir/usc/types";
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
    "ir/beatoraja": BeatorajaScore;
    "ir/usc": USCClientScore;

    // These aren't placeholder values - the data is yielded in a way that
    // the value of these is legitimately unknown at convert time.
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
    "file/pli-iidx-csv": IIDXEamusementCSVContext;

    "ir/direct-manual": BatchManualContext;
    "ir/barbatos": EmptyObject;
    "ir/fervidex": FervidexContext;
    "ir/fervidex-static": FervidexStaticContext;
    "ir/chunitachi": BatchManualContext;
    "ir/beatoraja": BeatorajaContext;
    "ir/usc": IRUSCContext;

    "api/arc-iidx": EmptyObject;
    "api/arc-sdvx": EmptyObject;
    "api/arc-jubeat": EmptyObject;
    "api/flo-iidx": KaiContext;
    "api/flo-sdvx": KaiContext;
    "api/eag-iidx": KaiContext;
    "api/eag-sdvx": KaiContext;
}

export interface OrphanScoreDocument<T extends ImportTypes = ImportTypes> extends MongoDBDocument {
    importType: T;
    data: ImportTypeDataMap[T];
    converterContext: ImportTypeContextMap[T];
    errMsg: string | null;
    orphanID: string;
    userID: integer;
    timeInserted: number;
}

export interface ConverterFnSuccessReturn {
    dryScore: DryScore;
    chart: AnyChartDocument;
    song: AnySongDocument;
}

export type ConverterFnReturnOrFailure = ConverterFailure | ConverterFnSuccessReturn;

export interface ConverterFunction<D, C> {
    (
        data: D,
        processContext: C,
        importType: ImportTypes,
        logger: KtLogger
    ): Promise<ConverterFnSuccessReturn>;
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
    classHandler: ClassHandler | null;
}

export interface ParserFunctionReturnsSync<D, C> {
    iterable: Iterable<D>;
    context: C;
    game: Game;
    classHandler: ClassHandler | null;
}
