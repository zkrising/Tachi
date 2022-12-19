import ImportAnalysers from "app/pages/dashboard/utils/ImportAnalysers";
import QuestEditor from "app/pages/dashboard/utils/QuestEditor";
import SeedsViewer from "app/pages/dashboard/utils/SeedsViewer";
import React from "react";
import { Route, Switch } from "react-router-dom";

export default function UtilRoutes() {
	return (
		<Switch>
			<Route exact path="/utils/seeds">
				<SeedsViewer />
			</Route>

			<Route path="/utils/imports">
				<ImportAnalysers />
			</Route>

			<Route exact path="/utils/quests">
				<QuestEditor />
			</Route>
		</Switch>
	);
}
