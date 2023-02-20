import { HistorySafeGoBack } from "util/misc";
import { ErrorPage } from "app/pages/ErrorPage";
import ForgotPasswordPage from "app/pages/ForgotPasswordPage";
import LoginPage from "app/pages/LoginPage";
import OAuthRequestAuthPage from "app/pages/OAuthRequestAuthPage";
import RegisterPage from "app/pages/RegisterPage";
import ResetPasswordPage from "app/pages/ResetPasswordPage";
import VerifyEmailPage from "app/pages/VerifyEmailPage";
import CenterPage from "components/util/CenterPage";
import ErrorBoundary from "components/util/ErrorBoundary";
import MainPageTitleContainer from "components/util/MainPageTitleContainer";
import { UserContext } from "context/UserContext";
import { ClientConfig } from "lib/config";
import React, { useContext } from "react";
import { Redirect, Route, Switch, useHistory } from "react-router-dom";
import ClientFileFlowRoutes from "./ClientFileFlowRoutes";
import DashboardRoutes from "./DashboardRoutes";
import OAuth2CallbackRoutes from "./OAuth2CallbackRoutes";
import RedirectLegacyRoutes from "./RedirectLegacyRoutes";

/**
 * Core Routes for Tachi-Client.
 * These are things that involve redirecting to non-dashboard apps.
 */
export function Routes() {
	const { user } = useContext(UserContext);

	const history = useHistory();

	return (
		<ErrorBoundary>
			<Switch>
				{/* redirects for legacy urls */}
				<Route path="/dashboard">
					<RedirectLegacyRoutes />
				</Route>

				<Route path="/michael">
					<ErrorPage statusCode={999} customMessage="He has been summoned." />
				</Route>

				<Route path="/verify-email">
					<VerifyEmailPage />
				</Route>

				<Route path="/oauth2-callback">
					<OAuth2CallbackRoutes />
				</Route>
				<Route path="/oauth/request-auth">
					<OAuthRequestAuthPage />
				</Route>

				<Route path="/client-file-flow">
					<ClientFileFlowRoutes />
				</Route>

				<Route exact path="/login">
					{user ? <Redirect to="/" /> : <LoginPage />}
				</Route>
				<Route exact path="/register">
					{user ? <Redirect to="/" /> : <RegisterPage />}
				</Route>
				<Route exact path="/forgot-password">
					{user ? <Redirect to="/" /> : <ForgotPasswordPage />}
				</Route>
				<Route exact path="/reset-password">
					{user ? <Redirect to="/" /> : <ResetPasswordPage />}
				</Route>
				<Route exact path="/screwed">
					{user ? (
						<Redirect to="/" />
					) : (
						<CenterPage>
							<MainPageTitleContainer
								title="You can't."
								desc="If you signed up with a fake email, you're now locked out of this account. Nice one."
							/>
							<span
								onClick={() => HistorySafeGoBack(history)}
								tabIndex={4}
								className="btn btn-outline-danger"
							>
								Back
							</span>
						</CenterPage>
					)}
				</Route>

				<Route path="*">
					{!user && ClientConfig.MANDATE_LOGIN ? <LoginPage /> : <DashboardRoutes />}
				</Route>
			</Switch>
		</ErrorBoundary>
	);
}
