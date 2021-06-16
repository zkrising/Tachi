import { Session, SessionData } from "express-session";
import { SYMBOL_TachiAPIAuth, SYMBOL_TachiData } from "../../src/lib/constants/tachi";
import { TachiRequestData, TachiSessionData } from "../../src/utils/types";
import { APITokenDocument } from "tachi-common";

export {};

// this only exists for testing context - it doesn't seem to work properly otherwise.
declare module "express-session" {
    // Inject additional properties on express-session
    interface SessionData {
        tachi: TachiSessionData;
    }
}

declare global {
    namespace Express {
        interface Request {
            session: Session & Partial<SessionData>;

            [SYMBOL_TachiData]?: Partial<TachiRequestData>;
            // even though this is technically *not* present on every request
            // it's always assigned in the main router, so its functionally equivalent.
            [SYMBOL_TachiAPIAuth]: APITokenDocument;
        }
    }
}
