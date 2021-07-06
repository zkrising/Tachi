import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import DashboardRoutes from "./DashboardRoutes";
import { ErrorPage } from "./pages/ErrorPage";

/**
 * Core Routes for Tachi-Client.
 * These are things that involve redirecting to non-dashboard apps.
 */
export function Routes() {
	return (
		<Switch>
			<Redirect exact from="/" to="/dashboard" />

			<Route path="/dashboard">
				<DashboardRoutes />
			</Route>

			<Route path="*">
				<ErrorPage statusCode={404} />
			</Route>
		</Switch>
	);
}
