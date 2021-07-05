import React, { Suspense } from "react";
import { Redirect, Switch, Route } from "react-router-dom";
import { LayoutSplashScreen } from "../_metronic/layout";
import { DashboardPage } from "./pages/DashboardPage";

export default function BasePage() {
	return (
		<Suspense fallback={<LayoutSplashScreen />}>
			<Switch>
				<Redirect exact from="/" to="/dashboard" />

				<Route path="/dashboard" component={DashboardPage} />
				<Redirect to="error" />
			</Switch>
		</Suspense>
	);
}
