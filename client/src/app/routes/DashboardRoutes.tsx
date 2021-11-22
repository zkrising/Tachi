import { ErrorPage } from "app/pages/ErrorPage";
import { Layout } from "components/layout/Layout";
import EmailVerify from "components/layout/misc/EmailVerify";
import { UserContext } from "context/UserContext";
import React, { useContext, useEffect, useState } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { APIFetchV1 } from "util/api";
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import CreditsPage from "../pages/dashboard/misc/CreditsPage";
import GameRoutes from "./GameRoutes";
import ImportRoutes from "./ImportRoutes";
import UserRoutes from "./UserRoutes";

export default function DashboardRoutes() {
	const { user } = useContext(UserContext);

	const [hasVerifiedEmail, setHasVerifiedEmail] = useState<boolean | null>(null);

	useEffect(() => {
		if (!user) {
			return setHasVerifiedEmail(null);
		}

		(async () => {
			const hasVerified = await APIFetchV1<boolean>(`/users/${user.id}/is-email-verified`);

			if (hasVerified.success) {
				setHasVerifiedEmail(hasVerified.body);
			}
		})();
	}, [user]);

	if (hasVerifiedEmail === false) {
		return (
			<Layout>
				<EmailVerify setHasVerifiedEmail={setHasVerifiedEmail} />
			</Layout>
		);
	}

	return (
		<Layout>
			<Switch>
				<Route exact path="/dashboard">
					<DashboardPage />
				</Route>

				<Route exact path="/dashboard/credits">
					<CreditsPage />
				</Route>

				<Route exact path="/dashboard/users">
					<Redirect to="/dashboard" />
				</Route>

				<Route exact path="/dashboard/games">
					<Redirect to="/dashboard" />
				</Route>

				<Route path="/dashboard/users/:userID">
					<UserRoutes />
				</Route>

				<Route path="/dashboard/games/:game">
					<GameRoutes />
				</Route>

				<Route path="/dashboard/import">
					<ImportRoutes />
				</Route>

				<Route path="*">
					<ErrorPage statusCode={404} />
				</Route>
			</Switch>
		</Layout>
	);
}
