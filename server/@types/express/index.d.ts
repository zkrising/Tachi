import { Session, SessionData } from "express-session";
import { SYMBOL_KtchiData } from "../../src/lib/constants/ktchi";
import { KtchiRequestData, KtchiSessionData } from "../../src/utils/types";

export {};

// this only exists for testing context - it doesn't seem to work properly otherwise.
declare module "express-session" {
    // Inject additional properties on express-session
    interface SessionData {
        ktchi: KtchiSessionData;
    }
}

declare global {
    namespace Express {
        interface Request {
            session: Session & Partial<SessionData>;

            [SYMBOL_KtchiData]?: Partial<KtchiRequestData>;
        }
    }
}
