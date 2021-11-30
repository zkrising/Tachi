import { ErrorPage } from "app/pages/ErrorPage";
import useSetSubheader from "components/layout/header/useSetSubheader";
import ApiError from "components/util/ApiError";
import Divider from "components/util/Divider";
import ExternalLink from "components/util/ExternalLink";
import useImport from "components/util/import/useImport";
import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import { UserContext } from "context/UserContext";
import { UserGameStatsContext } from "context/UserGameStatsContext";
import hashjs from "hash.js";
import React, { useContext, useMemo, useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
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
		return <div>Sorry, this service isn't supported here, apparantly.</div>;
	}

	const { user } = useContext(UserContext);

	if (!user) {
		return <ErrorPage statusCode={401} />;
	}

	const { isLoading, error, data } = useApiQuery<{ authStatus: boolean }>(
		`/users/${user.id}/integrations/kai/${kaiType}`
	);

	if (error) {
		return <ApiError error={error} />;
	}

	if (isLoading || !data) {
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
	const { setUGS } = useContext(UserGameStatsContext);

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
		<div>
			<h2 className="text-center mb-4">Authenticated with {kaiType}.</h2>
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
				Play on {kaiType} a lot? You can synchronise your scores straight from the discord
				by typing{" "}
				<code>
					/sync {kaiType} {game}
				</code>
				!
			</div>
			<Divider />
			<ImportStateRenderer state={importState} />
		</div>
	);
}

function KAINeedsIntegrate({ kaiType, hash, clientID, redirectUri }: Omit<Props, "game">) {
	const urlParams = new URLSearchParams({
		client_id: clientID,
		response_type: "code",
		redirectUri,
		scope: "settings_read",
	});

	const [url, setKey] = useState<string>("");

	const valid = useMemo(() => {
		if (!url) {
			return null;
		}

		return (
			hashjs
				.sha256()
				.update(url)
				.digest("hex") === hash
		);
	}, [url]);

	return (
		<div>
			<h4 className="text-center mb-4">You need to authenticate with {kaiType}!</h4>
			<Form.Group>
				<Form.Text>
					For security reasons, please input the URL of the site for {kaiType}.
				</Form.Text>
				<InputGroup>
					<InputGroup.Prepend>
						<InputGroup.Text>https://</InputGroup.Text>
					</InputGroup.Prepend>
					<Form.Control value={url} onChange={e => setKey(e.target.value)} />
				</InputGroup>
			</Form.Group>
			<Divider />
			<div>You'll need to come back to this page after linking!</div>
			<Divider />
			{valid === null ? null : valid ? (
				<ExternalLink
					className="btn btn-primary"
					href={`https://kailua.${url}/oauth/authorize?${urlParams.toString()}`}
				>
					Link with {kaiType}!
				</ExternalLink>
			) : (
				"Your input doesn't match up with the URL in our records."
			)}
		</div>
	);
}
