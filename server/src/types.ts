export type integer = number;

declare module "express-session" {
    // Inject additional properties on express-session
    interface SessionData {
        ktchi: KtchiSessionData;
    }
}

interface KtchiSessionData {
    userID: integer;
    apiKey: string;
}
