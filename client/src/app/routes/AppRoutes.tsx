import { UserContext } from "context/UserContext";
import React, { useContext } from "react";
import { Redirect, Route, Switch, useHistory } from "react-router-dom";
import DashboardRoutes from "./DashboardRoutes";
import { ErrorPage } from "app/pages/ErrorPage";
import LoginPage from "app/pages/LoginPage";
import RegisterPage from "app/pages/RegisterPage";
import ForgotPasswordPage from "app/pages/ForgotPasswordPage";
import ResetPasswordPage from "app/pages/ResetPasswordPage";
import CenterPage from "components/util/CenterPage";
import { ClientConfig } from "lib/config";
import MainPageTitleContainer from "components/util/MainPageTitleContainer";

/**
 * Core Routes for Tachi-Client.
 * These are things that involve redirecting to non-dashboard apps.
 */
export function Routes() {
	const { user } = useContext(UserContext);

	const history = useHistory();

	return (
		<Switch>
			<Route exact path="/">
				{!user && ClientConfig.MANDATE_LOGIN ? <LoginPage /> : <Redirect to="/dashboard" />}
			</Route>

			<Route path="/michael">
				<ErrorPage statusCode={999} customMessage="He has been summoned." />
			</Route>

			<Route path="/dashboard">
				{!user && ClientConfig.MANDATE_LOGIN ? <LoginPage /> : <DashboardRoutes />}
			</Route>

			<Route exact path="/login">
				{user ? <Redirect to="/dashboard" /> : <LoginPage />}
			</Route>
			<Route exact path="/register">
				{user ? <Redirect to="/dashboard" /> : <RegisterPage />}
			</Route>
			<Route exact path="/forgot-password">
				{user ? <Redirect to="/dashboard" /> : <ForgotPasswordPage />}
			</Route>
			<Route exact path="/reset-password">
				{user ? <Redirect to="/dashboard" /> : <ResetPasswordPage />}
			</Route>
			<Route exact path="/screwed">
				{user ? (
					<Redirect to="/dashboard" />
				) : (
					<CenterPage>
						<MainPageTitleContainer
							title="You can't."
							desc="If you signed up with a fake email, you're now locked out of this account. Nice one."
						/>
						<span
							onClick={() => history.goBack()}
							tabIndex={4}
							className="btn btn-outline-danger"
						>
							Back
						</span>
					</CenterPage>
				)}
			</Route>

			<Route path="*">
				<ErrorPage statusCode={404} />
			</Route>
		</Switch>
	);
}
