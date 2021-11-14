import useSetSubheader from "components/layout/header/useSetSubheader";
import ApiError from "components/util/ApiError";
import Divider from "components/util/Divider";
import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import UpdateUserGameStats from "components/util/UpdateUserGameStats";
import { UserContext } from "context/UserContext";
import { UserGameStatsContext } from "context/UserGameStatsContext";
import React, { useContext, useState } from "react";
import { Alert, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
	APIImportTypes,
	ARCSavedProfileDocument,
	GetGameConfig,
	ImportDocument,
} from "tachi-common";
import { ImportStates, NotStartedState } from "types/import";
import { APIFetchV1 } from "util/api";
import ImportStateRenderer from "./ImportStateRenderer";

export default function ARCImportPage({ game }: { game: "sdvx" | "iidx" }) {
	const importType: APIImportTypes = game === "iidx" ? "api/arc-iidx" : "api/arc-sdvx";
	const { setUGS } = useContext(UserGameStatsContext);
	const { user } = useContext(UserContext);

	useSetSubheader(["Imports", `ARC ${GetGameConfig(game).name} Synchronisation`]);

	if (!user) {
		return <>No user? How did you get here!</>;
	}

	const [importState, setImportState] = useState<ImportStates>(NotStartedState);

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
					<Link to={`/users/${user.id}/integrations`}>Service Settings for ARC</Link>, and
					link your account.
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
					onClick={async () => {
						setImportState({ state: "waiting" });

						const res = await APIFetchV1<ImportDocument>(
							"/import/from-api",
							{
								method: "POST",
								headers: {
									"Content-Type": "application/json",
								},
								body: JSON.stringify({
									importType,
								}),
							},
							true,
							true
						);

						if (res.success) {
							setImportState({ state: "done", import: res.body });
							UpdateUserGameStats(setUGS);
						} else {
							setImportState({ state: "failed", error: res.description });
						}
					}}
					disabled={importState.state === "waiting"}
				>
					{importState.state === "waiting" ? "Syncing..." : "Click to Sync!"}
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
						Barbatos
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
