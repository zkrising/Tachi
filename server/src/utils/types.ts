import { integer, ChartDocument, PublicUserDocument, UserGameStats } from "tachi-common";

declare module "express-session" {
    // Inject additional properties on express-session
    interface SessionData {
        tachi: TachiSessionData;
    }
}

export interface TachiSessionData {
    userID: integer;
}

export interface TachiAPIFailResponse {
    success: false;
    description: string;
}

export interface TachiAPISuccessResponse {
    success: true;
    description: string;
    body: Record<string, unknown>;
}

export type TachiAPIReponse = TachiAPIFailResponse | TachiAPISuccessResponse;

/**
 * Clarity type for empty objects - such as in context.
 */
export type EmptyObject = Record<string, never>;

/**
 * Data that may be monkey-patched onto req.tachi. This holds things such as middleware results.
 */
export interface TachiRequestData {
    uscChartDoc?: ChartDocument<"usc:Single">;

    beatorajaChartDoc?: ChartDocument<"bms:7K" | "bms:14K">;

    requestedUser?: PublicUserDocument;
    requestedUserGameStats?: UserGameStats;
}
