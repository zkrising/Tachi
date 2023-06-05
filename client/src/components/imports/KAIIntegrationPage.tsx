import { truncate } from "fs";
import { ErrorPage } from "app/pages/ErrorPage";
import useSetSubheader from "components/layout/header/useSetSubheader";
import ApiError from "components/util/ApiError";
import Divider from "components/util/Divider";
import ExternalLink from "components/util/ExternalLink";
import useImport from "components/util/import/useImport";
import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import { UserContext } from "context/UserContext";
import hashjs from "hash.js";
import React, { useContext, useMemo, useState } from "react";
import Alert from "react-bootstrap/Alert";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import { APIImportTypes, GetGameConfig } from "tachi-common";
import ImportStateRenderer from "./ImportStateRenderer";

interface Props {
	hash: string;
	kaiType: "FLO" | "EAG" | "MIN";
	clientID: string;
	redirectUri: string;
	game: "iidx" | "sdvx";
}

export default function KAIIntegrationPage({ clientID, hash, kaiType, redirectUri, game }: Props) {
	const gameConfig = GetGameConfig(game);

	useSetSubheader(["Import Scores", `${gameConfig.name} Sync (${kaiType})`]);

	if (!clientID) {
		return (
			<div>
				Sorry, this service isn't supported here.
				{process.env.VITE_IS_LOCAL_DEV &&
					` You haven't set VITE_${kaiType}_CLIENT_ID in your .env file.`}
			</div>
		);
	}

	const { user } = useContext(UserContext);

	if (!user) {
		return <ErrorPage statusCode={401} />;
	}

	const { data, error } = useApiQuery<{ authStatus: boolean }>(
		`/users/${user.id}/integrations/kai/${kaiType}`
	);

	if (error) {
		return <ApiError error={error} />;
	}

	if (!data) {
		return <Loading />;
	}

	if (data.authStatus) {
		return <KAIImporter kaiType={kaiType} game={game} />;
	} else {
		return <KAINeedsIntegrate {...{ kaiType, hash, clientID, redirectUri }} />;
	}
}

function KAIImporter({ kaiType, game }: Pick<Props, "kaiType" | "game">) {
	let importType: APIImportTypes;

	if (kaiType === "MIN") {
		importType = "api/min-sdvx";
	} else if (kaiType === "FLO") {
		importType = game === "iidx" ? "api/flo-iidx" : "api/flo-sdvx";
	} else {
		importType = game === "iidx" ? "api/eag-iidx" : "api/eag-sdvx";
	}

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
		<>
			<h2 className="text-center mb-4">Authenticated with {kaiType}.</h2>
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
				Play on {kaiType} a lot? You can synchronise your scores straight from the discord
				by typing <code>/sync</code>!
			</div>
			<Divider />
			<ImportStateRenderer state={importState} />
		</>
	);
}

function KAINeedsIntegrate({ kaiType, hash, clientID, redirectUri }: Omit<Props, "game">) {
	const urlParams = new URLSearchParams({
		client_id: clientID,
		response_type: "code",
		redirectUri,
		scope: "settings_read",
	});

	const [url, setUrl] = useState<string>("");

	const valid = useMemo(() => {
		if (!url) {
			return null;
		}

		return hashjs.sha256().update(url).digest("hex") === hash;
	}, [url]);

	return (
		<div>
			<h2 className="text-center mb-4">You need to authenticate with {kaiType}!</h2>
			<Form className="d-flex flex-column">
				<Form.Group>
					<Form.Text>
						For security reasons, please input the URL of the site for {kaiType}.
					</Form.Text>
					<InputGroup className="mb-4 mt-2">
						<InputGroup.Text>https://</InputGroup.Text>
						<Form.Control
							className="form-translucent"
							value={url}
							onChange={(e) => setUrl(e.target.value)}
							isInvalid={url.split(".").length >= 3 || url.includes("/")}
							isValid={valid === null ? undefined : valid}
						/>
					</InputGroup>
				</Form.Group>
				<Alert variant="warning" className="mb-0">
					You'll need to come back to this page after linking!
				</Alert>
				{valid || valid === null ? undefined : (
					<div className="mt-4">
						Your input doesn't match up with the URL in our records.
					</div>
				)}
				{url.split(".").length >= 3 && (
					<>
						<div className="text-danger mt-2">
							The URL should only have one <code>.</code> in it.
						</div>
					</>
				)}
				{url.includes("/") && (
					<>
						<div className="text-danger mt-2">
							The URL should not need any <code>/</code> characters!
						</div>
					</>
				)}
				<ExternalLink
					className={`btn btn-primary mt-4 align-self-end ${
						valid ? undefined : "disabled"
					}`}
					href={
						valid
							? `https://kailua.${url}/oauth/authorize?${urlParams.toString()}`
							: undefined
					}
				>
					Link with {kaiType}!
				</ExternalLink>
			</Form>
		</div>
	);
}
