import React from "react";
import { Switch, Route } from "react-router-dom";
import { Layout } from "../_metronic/layout";
import BasePage from "./BasePage";
import { ErrorPage } from "./pages/ErrorPage";

/**
 * Core Routes for Tachi-Client.
 * These are things that involve redirecting to non-dashboard apps.
 */
export function Routes() {
	return (
		<Switch>
			// This should be removed - as it's only for debugging.
			<Route path="/error">
				<ErrorPage statusCode={404} />
			</Route>
			<Layout>
				<BasePage />
			</Layout>
		</Switch>
	);
}
