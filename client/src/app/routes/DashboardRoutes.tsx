import { ErrorPage } from "app/pages/ErrorPage";
import { Layout } from "components/layout/Layout";
import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import CreditsPage from "../pages/dashboard/misc/CreditsPage";
import GameRoutes from "./GameRoutes";
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

				<Route exact path="/dashboard/users">
					<Redirect to="/dashboard" />
				</Route>

				<Route path="/dashboard/users/:userID">
					<UserRoutes />
				</Route>

				<Route path="/dashboard/games/:game">
					<GameRoutes />
				</Route>

				<Route path="*">
					<ErrorPage statusCode={404} />
				</Route>
			</Switch>
		</Layout>
	);
}
