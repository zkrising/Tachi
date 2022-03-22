import { APIFetchV1 } from "util/api";
import React, { createContext, useContext, useEffect, useState } from "react";
import { UserSettings } from "tachi-common";
import { JustChildren, SetState } from "types/react";
import { UserContext } from "./UserContext";

/**
 * Contains the current user's settings.
 */
export const UserSettingsContext = createContext<{
	settings: UserSettings | null;
	setSettings: SetState<UserSettings | null>;
}>({ settings: null, setSettings: () => void 0 });

UserSettingsContext.displayName = "UserSettingsContext";

export function UserSettingsContextProvider({ children }: JustChildren) {
	const [settings, setSettings] = useState<UserSettings | null>(null);

	const { user } = useContext(UserContext);

	useEffect(() => {
		if (!user) {
			return;
		}

		(async () => {
			const res = await APIFetchV1<UserSettings>(`/users/${user.id}/settings`);

			if (res.success) {
				setSettings(res.body);
			}
		})();

		return () => {
			setSettings(null);
		};
	}, [user]);

	return (
		<UserSettingsContext.Provider value={{ settings, setSettings }}>
			{children}
		</UserSettingsContext.Provider>
	);
}
