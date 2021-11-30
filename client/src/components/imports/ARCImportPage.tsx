import useSetSubheader from "components/layout/header/useSetSubheader";
import ApiError from "components/util/ApiError";
import Divider from "components/util/Divider";
import useImport from "components/util/import/useImport";
import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import { UserContext } from "context/UserContext";
import { UserGameStatsContext } from "context/UserGameStatsContext";
import React, { useContext } from "react";
import { Alert, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { APIImportTypes, ARCSavedProfileDocument, GetGameConfig } from "tachi-common";
import ImportStateRenderer from "./ImportStateRenderer";

export default function ARCImportPage({ game }: { game: "sdvx" | "iidx" }) {
	const importType: APIImportTypes = game === "iidx" ? "api/arc-iidx" : "api/arc-sdvx";
	const { setUGS } = useContext(UserGameStatsContext);
	const { user } = useContext(UserContext);

	useSetSubheader(["Imports", `ARC ${GetGameConfig(game).name} Synchronisation`]);

	const { importState, runImport } = useImport("/import/from-api", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			importType,
		}),
	});

	if (!user) {
		return <>No user? How did you get here!</>;
	}

	const { data, isLoading, error } = useApiQuery<{
		iidx: ARCSavedProfileDocument | null;
		sdvx: ARCSavedProfileDocument | null;
	}>(`/users/${user.id}/integrations/arc`);

	if (error) {
		return <ApiError error={error} />;
	}

	if (!data || isLoading) {
		return <Loading />;
	}

	if (!data[game]) {
		return (
			<div>
				<h2>You are not authenticated for ARC {GetGameConfig(game).name}.</h2>
				<br />
				<h4>
					Please go to the{" "}
					<Link to={`/dashboard/users/${user.id}/integrations`}>
						Service Settings for ARC
					</Link>
					, and link your account.
				</h4>
			</div>
		);
	}

	return (
		<div>
			<h2 className="text-center mb-4">Authenticated with ARC!</h2>
			<Divider />
			<div className="d-flex w-100 justify-content-center">
				<Button
					className="mx-auto"
					variant="primary"
					onClick={() => runImport()}
					disabled={
						importState.state === "waiting_init" ||
						importState.state === "waiting_processing"
					}
				>
					{importState.state === "waiting_init" ||
					importState.state === "waiting_processing"
						? "Syncing..."
						: "Click to Sync!"}
				</Button>
			</div>
			<Divider />
			<Alert variant="warning">
				Play on ARC a lot? Please consider setting up{" "}
				{game === "iidx" ? (
					<Link style={{ color: "purple" }} to="/dashboard/import/fervidex">
						Fervidex
					</Link>
				) : (
					<Link style={{ color: "purple" }} to="/dashboard/import/barbatos">
						Barbatos (Although it's not supported yet, sorry.)
					</Link>
				)}{" "}
				instead.
				<br />
				ARC exports poor quality data, and can only save one score on a chart at a time.
				<br />
				In an ideal world, you should only have to use this sync once, and then should
				switch to an import method that exports scores better!
			</Alert>
			<Divider />
			<ImportStateRenderer state={importState} />
		</div>
	);
}
