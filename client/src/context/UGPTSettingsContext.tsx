import React, { createContext, useState } from "react";
import { UGPTSettings } from "tachi-common";
import { JustChildren, SetState } from "types/react";

/**
 * Contains the current user's game playtype settings.
 */
export const UGPTSettingsContext = createContext<{
	settings: UGPTSettings | null;
	setSettings: SetState<UGPTSettings | null>;
}>({ settings: null, setSettings: () => void 0 });
UGPTSettingsContext.displayName = "UGPTSettingsContext";

export function UGPTSettingsContextProvider({ children }: JustChildren) {
	const [settings, setSettings] = useState<UGPTSettings | null>(null);

	return (
		<UGPTSettingsContext.Provider value={{ settings, setSettings }}>
			{children}
		</UGPTSettingsContext.Provider>
	);
}
