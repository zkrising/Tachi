import React, { Suspense } from "react";
import { Switch } from "react-router-dom";
import ExactRoute from "utils/ExactRoute";
import { LayoutSplashScreen, Layout } from "../_metronic/layout";
import { DashboardPage } from "./pages/DashboardPage";

export default function DashboardRoutes() {
	return (
		<Layout>
			<Suspense fallback={<LayoutSplashScreen />}>
				<Switch>
					<ExactRoute path="/dashboard">
						<DashboardPage />
					</ExactRoute>
				</Switch>
			</Suspense>
		</Layout>
	);
}
