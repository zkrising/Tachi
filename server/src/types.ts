import {
    AnyChartDocument,
    IDStrings,
    ImportTypes,
    ScoreDocument,
    SongDocument,
} from "kamaitachi-common";
import { Logger } from "winston";
import { ConverterFailure } from "./score-import/framework/core/converter-errors";
import { Converters } from "./score-import/import-types/import-types";

export type integer = number;

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
    song: SongDocument;
}

export type ConverterFnReturn = ConverterFailure | ConverterFnSuccessReturn | null;

export type ConverterFunctionReturns = ConverterFnReturn | ConverterFnReturn[];

export interface ConverterFunction<D, C> {
    (data: D, processContext: C, logger: Logger): Promise<ConverterFunctionReturns>;
}

export interface ImportInputParser<D, C> {
    (logger: Logger): ParserFunctionReturns<D, C> | Promise<ParserFunctionReturns<D, C>>;
}

export interface ParserFunctionReturnsSync<D, C> {
    iterable: Iterable<D>;
    idStrings: [IDStrings] & IDStrings[];
    context: C;
    ConverterFunction: ConverterFunction<D, C>;
}

export type ParserFunctionReturns<D, C> =
    | ParserFunctionReturnsAsync<D, C>
    | ParserFunctionReturnsSync<D, C>;

export interface ParserFunctionReturnsAsync<D, C> {
    iterable: AsyncIterable<D>;
    idStrings: [IDStrings] & IDStrings[];
    context: C;
    ConverterFunction: ConverterFunction<D, C>;
}

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
