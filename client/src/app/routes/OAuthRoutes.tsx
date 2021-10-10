import { ErrorPage } from "app/pages/ErrorPage";
import ManualAPIKeyPage from "app/pages/ManualAPIKeyPage";
import CenterLayoutPage from "components/layout/CenterLayoutPage";
import { UserContext } from "context/UserContext";
import React, { useContext } from "react";
import { Route, Switch } from "react-router-dom";

export default function OAuthRoutes() {
	const { user } = useContext(UserContext);

	if (!user) {
		return (
			<ErrorPage
				statusCode={401}
				customMessage="You have to be logged in to access these pages."
			/>
		);
	}

	return (
		<Switch>
			<Route exact path="/oauth/manual-apikey/:clientID">
				<CenterLayoutPage>
					<ManualAPIKeyPage />
				</CenterLayoutPage>
			</Route>

			<Route path="*">
				<ErrorPage statusCode={404} />
			</Route>
		</Switch>
	);
}
