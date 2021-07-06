import React, { Suspense } from "react";
import { Switch } from "react-router-dom";
import ExactRoute from "components/ExactRoute";
import { Layout } from "../_metronic/layout";
import { DashboardPage } from "./pages/DashboardPage";

export default function DashboardRoutes() {
	return (
		<Layout>
			<Switch>
				<ExactRoute path="/dashboard">
					<DashboardPage />
				</ExactRoute>
			</Switch>
		</Layout>
	);
}
