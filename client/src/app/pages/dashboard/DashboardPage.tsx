import useSetSubheader from "components/layout/header/useSetSubheader";
import SplashText from "components/util/SplashText";
import { UserSettingsContext } from "context/UserSettingsContext";
import React, { useContext } from "react";

export function DashboardPage() {
	const { settings } = useContext(UserSettingsContext);

	useSetSubheader("Dashboard", [settings]);

	return <>{/* <SplashText /> */}</>;
}
