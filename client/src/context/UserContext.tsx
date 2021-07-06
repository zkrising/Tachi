import { createContext } from "react";
import { PublicUserDocument } from "tachi-common";

/**
 * Contains the current user's user document.
 */
export const UserContext = createContext<PublicUserDocument | null>(null);
UserContext.displayName = "UserContext";
