import React, { createContext, useState } from "react";
import { UserGameStats } from "tachi-common";
import { JustChildren, SetState } from "types/react";

/**
 * Contains all of the currently logged-in users GPTStats.
 *
 * Used to display things like the "your games" tab, and assorted
 * dashboard info.
 */
export const AllLUGPTStatsContext = createContext<{
	ugs: UserGameStats[] | null;
	setUGS: SetState<UserGameStats[] | null>;
}>({ ugs: null, setUGS: () => void 0 });
AllLUGPTStatsContext.displayName = "AllLUGPTStatsContext";

export function AllLUGPTStatsContextProvider({ children }: JustChildren) {
	const [ugs, setUGS] = useState<UserGameStats[] | null>(null);

	return (
		<AllLUGPTStatsContext.Provider value={{ ugs, setUGS }}>
			{children}
		</AllLUGPTStatsContext.Provider>
	);
}
