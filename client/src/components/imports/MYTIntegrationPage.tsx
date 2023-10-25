import { ErrorPage } from "app/pages/ErrorPage";
import useSetSubheader from "components/layout/header/useSetSubheader";
import ApiError from "components/util/ApiError";
import Divider from "components/util/Divider";
import FormInput from "components/util/FormInput";
import Icon from "components/util/Icon";
import Loading from "components/util/Loading";
import useImport from "components/util/import/useImport";
import useApiQuery from "components/util/query/useApiQuery";
import { UserContext } from "context/UserContext";
import React, { useContext, useReducer, useState } from "react";
import { Form, Button } from "react-bootstrap";
import { APIImportTypes, GetGameConfig, MYTAuthDocument } from "tachi-common";
import { SetState } from "types/react";
import { APIFetchV1 } from "util/api";
import ImportStateRenderer from "./ImportStateRenderer";

export default function MYTIntegrationPage() {
	const gameConfig = GetGameConfig("maimai");

	useSetSubheader(["Import Scores", `${gameConfig.name} Sync (MYT)`]);

	const [reload, shouldReloadAuthInfo] = useReducer((x) => x + 1, 0);
	const [showEdit, setShowEdit] = useState(false);

	const { user } = useContext(UserContext);

	if (!user) {
		return <ErrorPage statusCode={401} />;
	}

	const { data, error } = useApiQuery<{ authStatus: boolean; }>(
		`/users/${user.id}/integrations/myt`,
		undefined,
		[reload]
	);

	if (error) {
		return <ApiError error={error} />;
	}

	if (!data) {
		return <Loading />;
	}

	return (
		<>
			{(showEdit || !data?.authStatus) && (
				<>
					<MYTNeedsIntegrate
						authStatus={data?.authStatus}
						onSubmit={async (token) => {
							const res = await APIFetchV1(
								`/users/${user.id}/integrations/myt`,
								{
									method: "PUT",
									body: JSON.stringify({ token }),
									headers: {
										"Content-Type": "application/json",
									},
								},
								true,
								true,
							);

							if (res.success) {
								shouldReloadAuthInfo();
							}
						}}
					/>
					<Divider />
				</>
			)}
			{data && (
				<MYTImporter
					showEdit={showEdit}
					setShowEdit={setShowEdit}
				/>
			)}
		</>
	)
}

export function MYTNeedsIntegrate({
	authStatus,
	onSubmit,
}: {
	authStatus?: boolean,
	onSubmit: (authToken: string) => Promise<void>;
}) {
	const [authToken, setAuthToken] = useState("");

	return (
		<div>
			<h3 className="text-center mb-4">{authStatus ? "Update " : "Set "} your MYT authentication token.</h3>

			<FormInput fieldName="Token" setValue={setAuthToken} value={authToken} />
			<Form.Label>
				You can retrieve a token by visiting your account profile on the MYT web portal.	
			</Form.Label>

			<Divider />

			<div className="w-100 d-flex justify-content-center">
				<Button onClick={() => onSubmit(authToken)}>
					Submit Token
				</Button>
			</div>
		</div>
	)
}

function MYTImporter({
	showEdit,
	setShowEdit,
}: {
	showEdit: boolean,
	setShowEdit: SetState<boolean>,
}) {
	const importType: APIImportTypes = "api/myt-maimai";

	const { importState, runImport } = useImport("/import/from-api", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			importType,
		}),
	});

	return (
		<div>
			<h2 className="text-center mb-4">
				Importing scores from MYT with saved token{" "}
				<Icon
					onClick={() => setShowEdit(!showEdit)}
					type={showEdit ? "times" : "pencil-alt"}
					noPad
				/>
				.
			</h2>
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
			<div>
				Play on MYT a lot? You can synchronise your scores straight from the discord by
				typing <code>/sync</code>!
			</div>
			<Divider />
			<ImportStateRenderer state={importState} />
		</div>
	);
}
