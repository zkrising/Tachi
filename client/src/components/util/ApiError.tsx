import { UserSettingsContext } from "context/UserSettingsContext";
import React, { useContext } from "react";
import { UnsuccessfulAPIFetchResponse } from "util/api";

export default function ApiError({ error }: { error: UnsuccessfulAPIFetchResponse }) {
	const { settings } = useContext(UserSettingsContext);

	return (
		<div>
			An error has occured
			{settings?.preferences.developerMode ? ` (${error.description})` : ""}
		</div>
	);
}
