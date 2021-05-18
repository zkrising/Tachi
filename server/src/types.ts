import {
    AnyChartDocument,
    IDStrings,
    ImportTypes,
    integer,
    ScoreDocument,
    AnySongDocument,
    MongoDBDocument,
    Game,
    Playtypes,
} from "kamaitachi-common";
import { Logger, LeveledLogMethod } from "winston";
import { ConverterFailure } from "./score-import/framework/common/converter-failures";
import { ClassHandler } from "./score-import/framework/user-game-stats/classes";
import {
    BatchManualContext,
    BatchManualScore,
} from "./score-import/import-types/common/batch-manual/types";
import {
    IIDXEamusementCSVContext,
    IIDXEamusementCSVData,
} from "./score-import/import-types/file/eamusement-iidx-csv/types";
import { S3Score } from "./score-import/import-types/file/solid-state-squad/types";
import { BarbatosScore } from "./score-import/import-types/ir/barbatos/types";
import {
    FervidexStaticContext,
    FervidexStaticScore,
} from "./score-import/import-types/ir/fervidex-static/types";
import { FervidexContext, FervidexScore } from "./score-import/import-types/ir/fervidex/types";

declare module "express-session" {
    // Inject additional properties on express-session
    interface SessionData {
        ktchi: KtchiSessionData;
    }
}

export interface KtchiSessionData {
    userID: integer;
    apiKey: string;
}

export interface KTFailResponse {
    success: false;
    description: string;
}

export interface KTSuccessResponse {
    success: true;
    description: string;
    body: Record<string, unknown>;
}

export type KTReponse = KTFailResponse | KTSuccessResponse;

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

export type ScorePlaytypeMap = Partial<Record<Playtypes[Game], ScoreDocument[]>>;

export type KtLogger = Logger & { severe: LeveledLogMethod };

/**
 * An intermediate score format that will be filled out by
 * HydrateScore.
 */
export type DryScore<I extends IDStrings = IDStrings> = Pick<
    ScoreDocument<I>,
    "service" | "game" | "scoreMeta" | "timeAchieved" | "comment" | "importType"
> & {
    scoreData: Omit<ScoreDocument<I>["scoreData"], "gradeIndex" | "lampIndex" | "esd">;
};

export interface ScoreConverterInformation<D, C> {
    data: D[];
    ConverterFunction: ConverterFunction<D, C>;
}

export interface OrphanedScore<T extends ImportTypes> {
    importType: T;
    data: ImportTypeDataMap[T];
    converterContext: ImportTypeContextMap[T];
    humanisedIdentifier: string;
}

export type RevaluedObject<T, U> = {
    [K in keyof T]: RevaluedObject<T[K], U> | U;
};

export interface TextDocument extends MongoDBDocument {
    text: string;
}

export interface ImportTypeDataMap {
    "file/eamusement-iidx-csv": IIDXEamusementCSVData;
    "file/batch-manual": BatchManualScore;
    "file/solid-state-squad": S3Score;
    "file/mer-iidx": EmptyObject;
    "file/pli-iidx-csv": EmptyObject;

    "ir/direct-manual": BatchManualScore;
    "ir/barbatos": BarbatosScore;
    "ir/fervidex": FervidexScore;
    "ir/fervidex-static": FervidexStaticScore;
    "ir/chunitachi": BatchManualScore;
    "ir/beatoraja": EmptyObject;
    "ir/usc": EmptyObject;

    "api/arc-iidx": EmptyObject;
    "api/arc-sdvx": EmptyObject;
    "api/arc-jubeat": EmptyObject;
    "api/flo-iidx": EmptyObject;
    "api/flo-sdvx": EmptyObject;
    "api/eag-iidx": EmptyObject;
    "api/eag-sdvx": EmptyObject;
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
    "api/flo-iidx": EmptyObject;
    "api/flo-sdvx": EmptyObject;
    "api/eag-iidx": EmptyObject;
    "api/eag-sdvx": EmptyObject;
}

/**
 * Clarity type for empty objects - such as in context.
 */
export type EmptyObject = Record<string, never>;
