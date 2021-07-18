import { ErrorPage } from "app/pages/ErrorPage";
import React from "react";
import { Route, Switch } from "react-router-dom";
import { Layout } from "_metronic/layout";
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import CreditsPage from "../pages/dashboard/misc/CreditsPage";
import UserRoutes from "./UserRoutes";

export default function DashboardRoutes() {
	return (
		<Layout>
			<Switch>
				<Route exact path="/dashboard">
					<DashboardPage />
				</Route>

				<Route exact path="/dashboard/credits">
					<CreditsPage />
				</Route>

				<Route path="/dashboard/users/:userID">
					<UserRoutes />
				</Route>

				<Route path="*">
					<ErrorPage statusCode={404} />
				</Route>
			</Switch>
		</Layout>
	);
}
