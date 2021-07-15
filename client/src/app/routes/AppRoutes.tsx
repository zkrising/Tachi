import { UserContext } from "context/UserContext";
import React, { useContext } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import DashboardRoutes from "./DashboardRoutes";
import { ErrorPage } from "app/pages/ErrorPage";
import LoginPage from "app/pages/LoginPage";
import RegisterPage from "app/pages/RegisterPage";

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

			<Route exact path="/login">
				{user ? <Redirect to="/dashboard" /> : <LoginPage />}
			</Route>
			<Route exact path="/register">
				{user ? <Redirect to="/dashboard" /> : <RegisterPage />}
			</Route>

			<Route path="*">
				<ErrorPage statusCode={404} />
			</Route>
		</Switch>
	);
}
