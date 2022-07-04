import React, { createContext, useState } from "react";
import { UserGameStats } from "tachi-common";
import { JustChildren, SetState } from "types/react";

/**
 * Contains the current user's stats
 */
export const UserGameStatsContext = createContext<{
	ugs: UserGameStats[] | null;
	setUGS: SetState<UserGameStats[] | null>;
}>({ ugs: null, setUGS: () => void 0 });
UserGameStatsContext.displayName = "UserContext";

export function UserGameStatsContextProvider({ children }: JustChildren) {
	const [ugs, setUGS] = useState<UserGameStats[] | null>(null);

	return (
		<UserGameStatsContext.Provider value={{ ugs, setUGS }}>
			{children}
		</UserGameStatsContext.Provider>
	);
}
