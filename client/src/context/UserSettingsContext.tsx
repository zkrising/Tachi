import React, { createContext, useState } from "react";
import { UserSettingsDocument } from "tachi-common";
import { JustChildren, SetState } from "types/react";

/**
 * Contains the current user's settings.
 */
export const UserSettingsContext = createContext<{
	settings: UserSettingsDocument | null;
	setSettings: SetState<UserSettingsDocument | null>;
}>({ settings: null, setSettings: () => void 0 });

UserSettingsContext.displayName = "UserSettingsContext";

export function UserSettingsContextProvider({ children }: JustChildren) {
	const [settings, setSettings] = useState<UserSettingsDocument | null>(null);

	return (
		<UserSettingsContext.Provider value={{ settings, setSettings }}>
			{children}
		</UserSettingsContext.Provider>
	);
}
