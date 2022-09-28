import SeedsViewer from "app/pages/dashboard/utils/SeedsViewer";
import React from "react";
import { Route, Switch } from "react-router-dom";

export default function UtilRoutes() {
	return (
		<Switch>
			<Route exact path="/dashboard/utils/seeds">
				<SeedsViewer />
			</Route>
		</Switch>
	);
}
