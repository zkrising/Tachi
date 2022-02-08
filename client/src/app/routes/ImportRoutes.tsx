import BarbatosPage from "app/pages/dashboard/import/BarbatosPage";
import BatchManualPage from "app/pages/dashboard/import/BatchManualPage";
import BeatorajaDBPage from "app/pages/dashboard/import/BeatorajaDBPage";
import BeatorajaIRPage from "app/pages/dashboard/import/BeatorajaIRPage";
import ChunitachiPage from "app/pages/dashboard/import/ChunitachiPage";
import FervidexPage from "app/pages/dashboard/import/FervidexPage";
import IIDXEamCSVPage from "app/pages/dashboard/import/IIDXEamCSVPage";
import ImportPage from "app/pages/dashboard/import/ImportPage";
import KsHookPage from "app/pages/dashboard/import/KsHookPage";
import LR2DBPage from "app/pages/dashboard/import/LR2DBPage";
import LR2HookPage from "app/pages/dashboard/import/LR2HookPage";
import MerJSONPage from "app/pages/dashboard/import/MerJSONPage";
import SDVXEamCSVPage from "app/pages/dashboard/import/SDVXEamCSVPage";
import SilentHookPage from "app/pages/dashboard/import/SilentHookPage";
import SSSXMLPage from "app/pages/dashboard/import/SSSXMLPage";
import USCDBPage from "app/pages/dashboard/import/USCDBPage";
import USCIRPage from "app/pages/dashboard/import/USCIRPage";
import WACCASiteImportPage from "app/pages/dashboard/import/WACCASiteImportPage";
import ARCImportPage from "components/imports/ARCImportPage";
import KAIIntegrationPage from "components/imports/KAIIntegrationPage";
import Divider from "components/util/Divider";
import { UserContext } from "context/UserContext";
import { mode } from "lib/config";
import React, { useContext } from "react";
import Switch from "react-bootstrap/esm/Switch";
import { Link, Redirect, Route } from "react-router-dom";

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

					{mode !== "ktchi" && (
						<>
							<Route exact path="/dashboard/import/beatoraja-ir">
								<BeatorajaIRPage game="bms" />
							</Route>
							<Route exact path="/dashboard/import/beatoraja-ir-pms">
								<BeatorajaIRPage game="pms" />
							</Route>
							<Route exact path="/dashboard/import/lr2hook">
								<LR2HookPage />
							</Route>
							<Route exact path="/dashboard/import/usc-ir">
								<USCIRPage />
							</Route>
							<Route exact path="/dashboard/import/usc-db">
								<USCDBPage />
							</Route>
							<Route exact path="/dashboard/import/lr2-db">
								<LR2DBPage />
							</Route>
							<Route exact path="/dashboard/import/beatoraja-db">
								<BeatorajaDBPage />
							</Route>
						</>
					)}

					{mode !== "btchi" && (
						<>
							<Route exact path="/dashboard/import/iidx-eam-csv">
								<IIDXEamCSVPage
									name="IIDX e-amusement CSV"
									importType="file/eamusement-iidx-csv"
								/>
							</Route>
							<Route exact path="/dashboard/import/iidx-pli-csv">
								<IIDXEamCSVPage
									name="IIDX PLI CSV"
									importType="file/pli-iidx-csv"
								/>
							</Route>
							<Route exact path="/dashboard/import/sdvx-eam-csv">
								<SDVXEamCSVPage
									name="SDVX e-amusement CSV"
									importType="file/eamusement-sdvx-csv"
								/>
							</Route>
							<Route exact path="/dashboard/import/iidx-mer">
								<MerJSONPage />
							</Route>
							<Route exact path="/dashboard/import/sss-xml">
								<SSSXMLPage />
							</Route>

							<Route exact path="/dashboard/import/fervidex">
								<FervidexPage />
							</Route>
							<Route exact path="/dashboard/import/barbatos">
								<BarbatosPage />
							</Route>
							<Route exact path="/dashboard/import/ks-hook">
								<KsHookPage />
							</Route>
							<Route exact path="/dashboard/import/silent-hook">
								<SilentHookPage />
							</Route>

							<Route exact path="/dashboard/import/chunitachi">
								<ChunitachiPage />
							</Route>

							<Route exact path="/dashboard/import/iidx-arc">
								<ARCImportPage game="iidx" />
							</Route>

							<Route exact path="/dashboard/import/sdvx-arc">
								<ARCImportPage game="sdvx" />
							</Route>

							<Route exact path="/dashboard/import/iidx-flo">
								<KAIIntegrationPage
									hash="6f64b82107cea90aa4c51a33705cd57c1883c8cdc22a634730ca461a431744b3"
									clientID={process.env.REACT_APP_FLO_CLIENT_ID ?? ""}
									redirectUri={`${window.location.origin}/oauth2-callback/flo`}
									kaiType="FLO"
									game="iidx"
								/>
							</Route>
							<Route exact path="/dashboard/import/iidx-eag">
								<KAIIntegrationPage
									hash="0451a33ffc7f8b0c089450d842efb8b7099e22a2df2251ae4e6d9ec1b3cb4a5f"
									clientID={process.env.REACT_APP_EAG_CLIENT_ID ?? ""}
									redirectUri={`${window.location.origin}/oauth2-callback/eag`}
									kaiType="EAG"
									game="iidx"
								/>
							</Route>
							<Route exact path="/dashboard/import/sdvx-min">
								<KAIIntegrationPage
									hash="5885d4123b6db3f0127111a587ea6549f533a178dc2e198d31f98bed4ffd0cad"
									clientID={process.env.REACT_APP_MIN_CLIENT_ID ?? ""}
									redirectUri={`${window.location.origin}/oauth2-callback/min`}
									kaiType="MIN"
									game="sdvx"
								/>
							</Route>
							<Route exact path="/dashboard/import/sdvx-flo">
								<KAIIntegrationPage
									hash="6f64b82107cea90aa4c51a33705cd57c1883c8cdc22a634730ca461a431744b3"
									clientID={process.env.REACT_APP_FLO_CLIENT_ID ?? ""}
									redirectUri={`${window.location.origin}/oauth2-callback/flo`}
									kaiType="FLO"
									game="sdvx"
								/>
							</Route>
							<Route exact path="/dashboard/import/sdvx-eag">
								<KAIIntegrationPage
									hash="0451a33ffc7f8b0c089450d842efb8b7099e22a2df2251ae4e6d9ec1b3cb4a5f"
									clientID={process.env.REACT_APP_EAG_CLIENT_ID ?? ""}
									redirectUri={`${window.location.origin}/oauth2-callback/eag`}
									kaiType="EAG"
									game="sdvx"
								/>
							</Route>

							<Route exact path="/dashboard/import/wacca-site">
								<WACCASiteImportPage />
							</Route>
						</>
					)}
				</Switch>
			</Route>
		</Switch>
	);
}
