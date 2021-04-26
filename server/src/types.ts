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
import { ConverterFailure } from "./score-import/framework/core/converter-errors";
import { Converters } from "./score-import/import-types/import-types";

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
    (data: D, processContext: C, logger: Logger): Promise<ConverterFunctionReturns>;
}

export interface ImportInputParser<D, C> {
    (logger: Logger): ParserFunctionReturns<D, C> | Promise<ParserFunctionReturns<D, C>>;
}

export type ParserFunctionReturns<D, C> =
    | ParserFunctionReturnsAsync<D, C>
    | ParserFunctionReturnsSync<D, C>;

export interface ParserFunctionReturnsAsync<D, C> {
    iterable: AsyncIterable<D>;
    idStrings: [IDStrings] & IDStrings[];
    context: C;
    game: Game;
    ConverterFunction: ConverterFunction<D, C>;
}

export interface ParserFunctionReturnsSync<D, C> {
    iterable: Iterable<D>;
    idStrings: [IDStrings] & IDStrings[];
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
    scoreData: Omit<ScoreDocument<I>["scoreData"], "gradeIndex" | "lampIndex">;
};

export interface ScoreConverterInformation<D, C> {
    data: D[];
    ConverterFunction: ConverterFunction<D, C>;
}

export interface OrphanedScore<T extends ImportTypes> {
    importType: T;
    data: Parameters<typeof Converters[T]>[0];
    converterContext: Parameters<typeof Converters[T]>[1];
    humanisedIdentifier: string;
}

export type RevaluedObject<T, U> = {
    [K in keyof T]: RevaluedObject<T[K], U> | U;
};

export interface TextDocument extends MongoDBDocument {
    text: string;
}
