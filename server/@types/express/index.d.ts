import { Session, SessionData } from "express-session";
import { SYMBOL_TachiData } from "../../src/lib/constants/tachi";
import { TachiRequestData, TachiSessionData } from "../../src/utils/types";

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
        }
    }
}
