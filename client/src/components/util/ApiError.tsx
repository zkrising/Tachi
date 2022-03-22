import { UnsuccessfulAPIFetchResponse } from "util/api";
import { UserSettingsContext } from "context/UserSettingsContext";
import React, { useContext } from "react";

export default function ApiError({ error }: { error: UnsuccessfulAPIFetchResponse }) {
	const { settings } = useContext(UserSettingsContext);

	return (
		<div>
			An error has occured
			{settings?.preferences.developerMode ? ` (${error.description})` : ""}
		</div>
	);
}
