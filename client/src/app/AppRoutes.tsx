import { UserContext } from "context/UserContext";
import React, { useContext } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import ExactRoute from "components/ExactRoute";
import DashboardRoutes from "./DashboardRoutes";
import { ErrorPage } from "./pages/ErrorPage";
import LoginPage from "./pages/LoginPage";

/**
 * Core Routes for Tachi-Client.
 * These are things that involve redirecting to non-dashboard apps.
 */
export function Routes() {
	const { user } = useContext(UserContext);

	return (
		<Switch>
			<Redirect exact from="/" to="/dashboard" />

			<Route path="/dashboard">
				<DashboardRoutes />
			</Route>

			<ExactRoute path="/login">
				{user ? <Redirect to="/dashboard" /> : <LoginPage />}
			</ExactRoute>
			<ExactRoute path="/register">
				{user ? <Redirect to="/dashboard" /> : <LoginPage />}
			</ExactRoute>

			<Route path="*">
				<ErrorPage statusCode={404} />
			</Route>
		</Switch>
	);
}
