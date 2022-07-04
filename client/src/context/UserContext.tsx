import React, { createContext, useState } from "react";
import { PublicUserDocument } from "tachi-common";
import { JustChildren, SetState } from "types/react";

/**
 * Contains the current user's user document.
 */
export const UserContext = createContext<{
	user: PublicUserDocument | null;
	setUser: SetState<PublicUserDocument | null>;
}>({ user: null, setUser: () => void 0 });
UserContext.displayName = "UserContext";

export function UserContextProvider({ children }: JustChildren) {
	const [user, setUser] = useState<PublicUserDocument | null>(null);

	return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
}
