import BatchManualPage from "app/pages/dashboard/import/BatchManualPage";
import BeatorajaIRPage from "app/pages/dashboard/import/BeatorajaIRPage";
import IIDXEamCSVPage from "app/pages/dashboard/import/IIDXEamCSVPage";
import ImportPage from "app/pages/dashboard/import/ImportPage";
import MerJSONPage from "app/pages/dashboard/import/MerJSONPage";
import SSSXMLPage from "app/pages/dashboard/import/SSSXMLPage";
import USCIRPage from "app/pages/dashboard/import/USCIRPage";
import { ErrorPage } from "app/pages/ErrorPage";
import Divider from "components/util/Divider";
import { UserContext } from "context/UserContext";
import React, { useContext } from "react";
import Switch from "react-bootstrap/esm/Switch";
import { Link, Route, Redirect } from "react-router-dom";

export default function ImportRoutes() {
	const { user } = useContext(UserContext);

	if (!user) {
		return <Redirect to="/login" />;
	}

	return (
		<Switch>
			<Route exact path="/dashboard/import">
				<ImportPage />
			</Route>

			<Route path="/dashboard/import/*">
				<div>
					<Link to="/dashboard/import">Go back to all import methods.</Link>
					<Divider />
				</div>
				<Switch>
					<Route exact path="/dashboard/import/batch-manual">
						<BatchManualPage />
					</Route>

					<Route exact path="/dashboard/import/iidx-eam-csv">
						<IIDXEamCSVPage
							name="IIDX e-amusement CSV"
							importType="file/eamusement-iidx-csv"
						/>
					</Route>

					<Route exact path="/dashboard/import/iidx-pli-csv">
						<IIDXEamCSVPage name="IIDX PLI CSV" importType="file/pli-iidx-csv" />
					</Route>

					<Route exact path="/dashboard/import/iidx-mer">
						<MerJSONPage />
					</Route>

					<Route exact path="/dashboard/import/sss-xml">
						<SSSXMLPage />
					</Route>

					<Route exact path="/dashboard/import/beatoraja-ir">
						<BeatorajaIRPage />
					</Route>

					<Route exact path="/dashboard/import/usc-ir">
						<USCIRPage />
					</Route>
				</Switch>
			</Route>
		</Switch>
	);
}
