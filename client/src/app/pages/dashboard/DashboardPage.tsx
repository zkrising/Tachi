import useSetSubheader from "components/layout/header/useSetSubheader";
import SplashText from "components/util/SplashText";
import React from "react";

export function DashboardPage() {
	useSetSubheader("Dashboard");

	return (
		<>
			<SplashText />
		</>
	);
}
