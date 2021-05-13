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
import { ConverterFailure } from "./score-import/framework/score-importing/converter-failures";
import {
    BatchManualContext,
    BatchManualScore,
} from "./score-import/import-types/common/batch-manual/types";
import {
    IIDXEamusementCSVContext,
    IIDXEamusementCSVData,
} from "./score-import/import-types/file/csv/eamusement-iidx/types";

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
}

export interface ParserFunctionReturnsSync<D, C> {
    iterable: Iterable<D>;
    context: C;
    game: Game;
    ConverterFunction: ConverterFunction<D, C>;
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
    "file/csv:eamusement-iidx": IIDXEamusementCSVData;
    "file/json:batch-manual": BatchManualScore;
    "ir/json:direct-manual": BatchManualScore;
}

export interface ImportTypeContextMap {
    "file/csv:eamusement-iidx": IIDXEamusementCSVContext;
    "file/json:batch-manual": BatchManualContext;
    "ir/json:direct-manual": BatchManualContext;
}
