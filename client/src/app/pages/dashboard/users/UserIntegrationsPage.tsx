import useSetSubheader from "components/layout/header/useSetSubheader";
import Card from "components/layout/page/Card";
import ApiError from "components/util/ApiError";
import Divider from "components/util/Divider";
import ExternalLink from "components/util/ExternalLink";
import FormInput from "components/util/FormInput";
import Icon from "components/util/Icon";
import Loading from "components/util/Loading";
import Muted from "components/util/Muted";
import useApiQuery from "components/util/query/useApiQuery";
import SelectButton from "components/util/SelectButton";
import { mode, TachiConfig } from "lib/config";
import React, { useEffect, useState } from "react";
import { Alert, Button, Col, Form, Modal, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
	APIPermissions,
	APITokenDocument,
	integer,
	PublicUserDocument,
	TachiAPIClientDocument,
} from "tachi-common";
import { SetState } from "types/react";
import { APIFetchV1 } from "util/api";
import { allPermissions, DelayedPageReload } from "util/misc";
import ARCIntegrationPage from "./ARCIntegrationPage";
import FervidexIntegrationPage from "./FervidexIntegrationPage";

export default function UserIntegrationsPage({ reqUser }: { reqUser: PublicUserDocument }) {
	const [page, setPage] = useState<"services" | "api-keys" | "oauth-clients">("api-keys");

	useSetSubheader(
		["Users", reqUser.username, "Integrations"],
		[reqUser],
		`${reqUser.username}'s Integrations`
	);

	return (
		<Card header="Integrations" className="col-12 offset-lg-2 col-lg-8">
			<Row>
				<Col xs={12}>
					<div className="btn-group d-flex justify-content-center">
						{mode !== "btchi" && (
							<SelectButton value={page} setValue={setPage} id="services">
								<Icon type="network-wired" />
								Service Configuration
							</SelectButton>
						)}
						<SelectButton value={page} setValue={setPage} id="api-keys">
							<Icon type="key" />
							API Keys
						</SelectButton>
						<SelectButton value={page} setValue={setPage} id="oauth-clients">
							<Icon type="robot" />
							My API Clients
						</SelectButton>
					</div>
					<Divider />
				</Col>
				<Col xs={12}>
					{page === "services" ? (
						<ServicesPage reqUser={reqUser} />
					) : page === "api-keys" ? (
						<APIKeysPage reqUser={reqUser} />
					) : (
						<OAuthClientPage />
					)}
				</Col>
			</Row>
		</Card>
	);
}

function OAuthClientPage() {
	return (
		<Row className="text-center justify-content-center">
			<Col xs={12}>
				<h3>API Clients</h3>
				<Alert variant="info" style={{ color: "black" }}>
					This page is for programmers who want to make their own things that interface
					with {TachiConfig.name}.
					<br />
					You can read the documentation{" "}
					<ExternalLink
						style={{ color: "white" }}
						href="https://tachi.readthedocs.io/en/latest/tachi-server/infrastructure/api-clients/"
					>
						here
					</ExternalLink>
					!
				</Alert>
				<Muted>Register your own clients for integrating with {TachiConfig.name}.</Muted>
			</Col>
			<Col xs={12}>
				<OAuthClientInfo />
			</Col>
		</Row>
	);
}

function OAuthClientInfo() {
	const { data, isLoading, error } = useApiQuery<TachiAPIClientDocument[]>("/clients");

	const [clients, setClients] = useState<TachiAPIClientDocument[]>([]);

	useEffect(() => {
		setClients(data ?? []);
	}, [data]);

	if (error) {
		return <ApiError error={error} />;
	}

	if (isLoading || !data) {
		return <Loading />;
	}

	if (clients.length === 0) {
		return (
			<>
				<Muted>You don't have any API Clients.</Muted>
				<Divider />
				<CreateNewOAuthClient setClients={setClients} />
			</>
		);
	}

	return (
		<>
			{clients.map(e => (
				<OAuthClientRow
					setClients={setClients}
					clients={clients}
					key={e.clientID}
					client={e}
				/>
			))}
			<Divider />
			<CreateNewOAuthClient setClients={setClients} />
		</>
	);
}

function CreateNewOAuthClient({ setClients }: { setClients: SetState<TachiAPIClientDocument[]> }) {
	const [show, setShow] = useState(false);
	const [name, setName] = useState("");
	const [redirectUri, setRedirectUri] = useState("");
	const [webhookUri, setWebhookUri] = useState("");
	const [apiKeyFilename, setApiKeyFilename] = useState("");
	const [apiKeyTemplate, setApiKeyTemplate] = useState("");
	const [permissions, setPermissions] = useState<APIPermissions[]>([]);

	return (
		<>
			<Button onClick={() => setShow(true)} variant="success">
				Create New Client
			</Button>
			<Modal show={show} onHide={() => setShow(false)}>
				<Modal.Header closeButton>
					<Modal.Title>Create New Client</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form
						onSubmit={async e => {
							e.preventDefault();

							const res = await APIFetchV1(
								"/clients/create",
								{
									method: "POST",
									headers: {
										"Content-Type": "application/json",
									},
									body: JSON.stringify({
										name,
										redirectUri: redirectUri || null,
										permissions,
										apiKeyTemplate: apiKeyTemplate || null,
										apiKeyFilename: apiKeyFilename || null,
										webhookUri: webhookUri || null,
									}),
								},
								true,
								true
							);

							if (res.success) {
								DelayedPageReload();
							}
						}}
					>
						<div className="input-group">
							<div className="input-group-append">
								<span className="input-group-text">Name</span>
							</div>
							<input
								value={name}
								className="form-control"
								onChange={e => setName(e.target.value)}
								placeholder="My API Client"
							/>
						</div>
						<Muted>
							Give your Service a name. This will be shown when users use follow OAuth
							flow.
						</Muted>
						<Divider />
						<div className="input-group">
							<div className="input-group-append">
								<span className="input-group-text">Redirect URI</span>
							</div>
							<input
								value={redirectUri}
								className="form-control"
								onChange={e => setRedirectUri(e.target.value)}
								placeholder="https://example.com/callback"
							/>
						</div>
						<Muted>
							This is the URL {TachiConfig.name} will redirect to as part of the OAuth
							flow.
						</Muted>
						<Divider />
						<FormInput
							fieldName="Webhook Uri"
							value={webhookUri}
							setValue={setWebhookUri}
							placeholder="https://example.com/webhook"
						/>
						<Muted>
							This is the URL {TachiConfig.name} will send webhook info to. Leave this
							blank to not recieve webhook events.
						</Muted>
						<Divider />
						<FormInput
							as="textarea"
							fieldName="File Template"
							value={apiKeyTemplate}
							setValue={setApiKeyTemplate}
							placeholder={JSON.stringify({ token: "%%TACHI_KEY%%" }, null, "\t")}
						/>
						<Muted>
							In what format should a generated API Key be shown to the user? This
							only applies to Client File Flow. <code>%%TACHI_KEY%%</code> will be
							replaced with the generated key. Read more about client file flow{" "}
							<ExternalLink href="https://tachi.readthedocs.io/en/latest/tachi-server/infrastructure/file-flow/">
								here
							</ExternalLink>
							.
							<br />
							Leave this empty to spit the key out directly.
						</Muted>
						{apiKeyTemplate !== "" && !apiKeyTemplate.includes("%%TACHI_KEY%%") && (
							<>
								<br />
								<span className="text-danger">
									No %%TACHI_KEY%% detected in file template. Please add one!
								</span>
							</>
						)}
						<Divider />
						<FormInput
							fieldName="File Template"
							value={apiKeyFilename}
							setValue={setApiKeyFilename}
							placeholder="my-service-config.json"
						/>
						<Muted>
							If this is not empty, Client File Flow will result in a file of this
							name being downloaded (in the above format).
						</Muted>
						<Divider />
						<h4>Permissions</h4>
						<div className="px-4">
							{allPermissions.map(permission => (
								<>
									<input
										key={permission}
										className="form-check-input"
										type="checkbox"
										onChange={e => {
											if (e.target.checked) {
												setPermissions([...permissions, permission]);
											} else {
												setPermissions(
													permissions.filter(e => e !== permission)
												);
											}
										}}
									/>
									<label className="form-check-label">{permission}</label>
									<br />
								</>
							))}
						</div>

						<Divider />
						<button type="submit" className="btn btn-success">
							Create Client
						</button>
					</Form>
				</Modal.Body>
			</Modal>
		</>
	);
}

interface OAuthClientProps {
	client: TachiAPIClientDocument;
	clients: TachiAPIClientDocument[];
	setClients: SetState<TachiAPIClientDocument[]>;
}

function OAuthClientRow({ client, clients, setClients }: OAuthClientProps) {
	const [hasWarned, setHasWarned] = useState(false);
	const [showDangerousStuff, setShowDangerousStuff] = useState(false);
	const [deleteModalShow, setDeleteModalShow] = useState(false);
	const [editModalShow, setEditModalShow] = useState(false);

	return (
		<div key={client.clientID} className="col-12">
			<Divider />

			<h2 className="mb-4">{client.name}</h2>
			<div className="text-left">
				<h5>
					Client ID: <code>{client.clientID}</code>
				</h5>
				<h5>
					Client Secret:{" "}
					<code onClick={() => setHasWarned(true)}>
						{hasWarned ? client.clientSecret : "SENSITIVE: CLICK TO REVEAL"}
					</code>
				</h5>
				<h5>
					Permissions: <code>{client.requestedPermissions.join(", ")}</code>
				</h5>
				<h5>
					Redirect Uri: <code>{client.redirectUri ?? "No Redirect URI"}</code>
				</h5>
				<h5>
					Webhook Uri: <code>{client.webhookUri ?? "No Webhook URI"}</code>
				</h5>
				<h5>
					Download Filename: <code>{client.apiKeyFilename ?? "No Filename"}</code>
				</h5>
				<h5>
					File Format:{" "}
					<textarea
						readOnly
						className="w-100 mt-2 text-monospace"
						value={client.apiKeyTemplate ?? "%%TACHI_KEY%%"}
					/>
				</h5>
				<h6>
					Client File Flow Link: <br />
					<code>
						{window.location.origin}/client-file-flow/{client.clientID}
					</code>
				</h6>
			</div>

			<Divider />

			<div className="d-flex" style={{ justifyContent: "space-around" }}>
				<Button variant="info" onClick={() => setEditModalShow(!editModalShow)}>
					Edit Client
				</Button>

				<Button
					onClick={() => {
						setShowDangerousStuff(!showDangerousStuff);
					}}
					variant="danger"
				>
					{showDangerousStuff ? "Hide Dangerous Stuff" : "Show Dangerous Stuff"}
				</Button>
			</div>

			{showDangerousStuff && (
				<div className="mt-8">
					<Button
						onClick={async () => {
							const res = await APIFetchV1<TachiAPIClientDocument>(
								`/clients/${client.clientID}/reset-secret`,
								{
									method: "POST",
								},
								true,
								true
							);

							if (res.success) {
								setClients(
									clients.map(e => {
										if (e.clientID === client.clientID) {
											return res.body;
										}
										return e;
									})
								);
							}
						}}
						variant="warning"
					>
						Reset Client Secret
					</Button>
					<br />
					<Muted>
						You can reset your client secret incase you accidentally exposed it.
					</Muted>
					<br />
					<Button
						className="mt-4"
						onClick={() => setDeleteModalShow(true)}
						variant="danger"
					>
						Destroy Client
					</Button>
					<br />
					<Muted>
						This will destroy your client and all API Keys associated with it.
					</Muted>
				</div>
			)}

			<EditClientModal
				{...{ client, setClients, clients, show: editModalShow, setShow: setEditModalShow }}
			/>

			<Modal show={deleteModalShow} onHide={() => setDeleteModalShow(false)}>
				<Modal.Header closeButton>
					<Modal.Title>Seriously, are you really sure?</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					All keys ever created for this API Client will be deleted.
					<br />
					<strong className="text-danger">
						ALL USERS USING THIS APPLICATION WILL NO LONGER BE ABLE TO USE THE
						ASSOCIATED KEYS!
					</strong>
					<Divider />
					<div className="w-100 d-flex justify-content-center">
						<Button
							variant="danger"
							onClick={async () => {
								const res = await APIFetchV1(
									`/clients/${client.clientID}`,
									{
										method: "DELETE",
									},
									true,
									true
								);

								if (res.success) {
									setClients(clients.filter(e => e.clientID !== client.clientID));
								}
							}}
						>
							I'm sure.
						</Button>
					</div>
				</Modal.Body>
			</Modal>
		</div>
	);
}

function EditClientModal({
	client,
	clients,
	setClients,
	show,
	setShow,
}: OAuthClientProps & {
	show: boolean;
	setShow: SetState<boolean>;
}) {
	const [name, setName] = useState(client.name);
	const [redirectUri, setRedirectUri] = useState(client.redirectUri ?? "");
	const [webhookUri, setWebhookUri] = useState(client.webhookUri ?? "");
	const [apiKeyFilename, setApiKeyFilename] = useState(client.apiKeyFilename ?? "");
	const [apiKeyTemplate, setApiKeyTemplate] = useState(client.apiKeyTemplate ?? "");

	return (
		<Modal show={show} onHide={() => setShow(false)}>
			<Modal.Header closeButton>
				<Modal.Title>Edit {client.name}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form
					onSubmit={async e => {
						e.preventDefault();

						const res = await APIFetchV1<TachiAPIClientDocument>(
							`/clients/${client.clientID}`,
							{
								method: "PATCH",
								headers: {
									"Content-Type": "application/json",
								},
								body: JSON.stringify({
									name,
									redirectUri,
									webhookUri: webhookUri === "" ? null : webhookUri,
									apiKeyFilename: apiKeyFilename === "" ? null : apiKeyFilename,
									apiKeyTemplate: apiKeyTemplate === "" ? null : apiKeyTemplate,
								}),
							},
							true,
							true
						);

						if (res.success) {
							setClients(
								clients.map(e => {
									if (e.clientID === client.clientID) {
										return res.body;
									}

									return e;
								})
							);
						}
					}}
				>
					<FormInput
						fieldName="Client Name"
						value={name}
						setValue={setName}
						placeholder="My API Client"
					/>
					<Divider />
					<FormInput
						fieldName="Redirect URI"
						value={redirectUri}
						setValue={setRedirectUri}
						placeholder="https://example.com/callback"
					/>
					<Muted>
						Where a user will be redirected to after completing the OAuth flow.
					</Muted>

					<Divider />
					<FormInput
						fieldName="Webhook URI"
						value={webhookUri}
						setValue={setWebhookUri}
						placeholder="https://example.com/webhook"
					/>
					<Muted>
						Where to send webhook events to. Please read the{" "}
						<ExternalLink href="https://tachi.readthedocs.io/en/latest/api/webhooks/main/">
							Webhook Documentation
						</ExternalLink>{" "}
						before using this, as there are necessary security precautions.
					</Muted>

					<Divider />
					<FormInput
						as="textarea"
						fieldName="File Template"
						value={apiKeyTemplate}
						setValue={setApiKeyTemplate}
						placeholder={JSON.stringify({ token: "%%TACHI_KEY%%" }, null, "\t")}
					/>
					<Muted>
						In what format should a generated API Key be shown to the user? This only
						applies to Client File Flow. <code>%%TACHI_KEY%%</code> will be replaced
						with the generated key. Read more about client file flow{" "}
						<ExternalLink href="https://tachi.readthedocs.io/en/latest/tachi-server/infrastructure/file-flow/">
							here
						</ExternalLink>
						.
						<br />
						Leave this empty to spit the key out directly.
					</Muted>
					{apiKeyTemplate !== "" && !apiKeyTemplate.includes("%%TACHI_KEY%%") && (
						<>
							<br />
							<span className="text-danger">
								No %%TACHI_KEY%% detected in file template. Please add one!
							</span>
						</>
					)}
					<Divider />
					<FormInput
						fieldName="File Template"
						value={apiKeyFilename}
						setValue={setApiKeyFilename}
						placeholder="my-service-config.json"
					/>
					<Muted>
						If this is not empty, Client File Flow will result in a file of this name
						being downloaded (in the above format).
					</Muted>

					<Divider />

					<button type="submit" className="btn btn-success">
						Update Client
					</button>
				</Form>
			</Modal.Body>
		</Modal>
	);
}

function ServicesPage({ reqUser }: { reqUser: PublicUserDocument }) {
	if (mode === "btchi") {
		return (
			<Row className="text-center">
				Looks like there's no services available for integration.
			</Row>
		);
	}

	const [page, setPage] = useState<"fervidex" | "arc" | "flo" | "eag" | "min">("fervidex");

	return (
		<Row className="text-center justify-content-center">
			<Col xs={12}>
				<h3>Service Configuration</h3>
				<span>
					This is for <b>Configuring Integrations!</b>
				</span>
				<br />
				<Muted>
					Note: Some services have had their names truncated to their first three
					characters for privacy reasons.
				</Muted>
				<Divider />
			</Col>
			<Col xs={12}>
				<div className="btn-group">
					<SelectButton value={page} setValue={setPage} id="fervidex">
						Fervidex
					</SelectButton>
					<SelectButton value={page} setValue={setPage} id="arc">
						ARC
					</SelectButton>
					<SelectButton value={page} setValue={setPage} id="flo">
						FLO
					</SelectButton>
					<SelectButton value={page} setValue={setPage} id="eag">
						EAG
					</SelectButton>
					<SelectButton value={page} setValue={setPage} id="min">
						MIN
					</SelectButton>
				</div>
				<Divider />
			</Col>
			{page === "fervidex" ? (
				<FervidexIntegrationPage reqUser={reqUser} />
			) : page === "arc" ? (
				<ARCIntegrationPage reqUser={reqUser} />
			) : page === "flo" ? (
				<KAIIntegrationStatus userID={reqUser.id} kaiType="flo" />
			) : page === "eag" ? (
				<KAIIntegrationStatus userID={reqUser.id} kaiType="eag" />
			) : (
				<KAIIntegrationStatus userID={reqUser.id} kaiType="min" />
			)}
		</Row>
	);
}

function KAIIntegrationStatus({
	kaiType,
	userID,
}: {
	kaiType: "flo" | "eag" | "min";
	userID: integer;
}) {
	const { data, isLoading, error } = useApiQuery<{ authStatus: boolean }>(
		`/users/${userID}/integrations/kai/${kaiType}`
	);

	if (error) {
		return <ApiError error={error} />;
	}

	if (isLoading || !data) {
		return <Loading />;
	}

	return (
		<div className="row">
			<div className="col-12">
				<h3>
					{data.authStatus
						? `You are authenticated with ${kaiType.toUpperCase()}!`
						: `You are not authenticated with ${kaiType.toUpperCase()}`}
				</h3>
				{data.authStatus ? (
					<h4>There's no configuration to do here. You're all good!</h4>
				) : (
					<h4>
						You should authenticate yourself by going to{" "}
						<Link to="/dashboard/import">Import Scores</Link> for the thing you want to
						import for!1
					</h4>
				)}
			</div>
		</div>
	);
}

function APIKeysPage({ reqUser }: { reqUser: PublicUserDocument }) {
	const [apiKeys, setApiKeys] = useState<APITokenDocument[]>([]);
	const [showModal, setShowModal] = useState(false);

	const { data, isLoading, error } = useApiQuery<APITokenDocument[]>(
		`/users/${reqUser.id}/api-tokens`
	);

	useEffect(() => {
		if (data) {
			setApiKeys(data);
		}
	}, [data]);

	if (error) {
		return <ApiError error={error} />;
	}

	if (isLoading || !data) {
		return <Loading />;
	}

	return (
		<>
			<Alert variant="danger" style={{ color: "black" }}>
				API Keys allow other programs to interact with {TachiConfig.name} on your behalf.
				They have limited permissions, so they can't just change your password!
				<br />
				<br />
				In contrast to Integrations, API Keys let other programs interact with{" "}
				{TachiConfig.name}, rather than the other way around.
				<br />
				<br />
				Still, the stuff on this page is sensitive information! Be careful who you give
				these keys to.
			</Alert>
			<div className="row">
				{apiKeys.length === 0 ? (
					<div className="text-center">You have no API Keys.</div>
				) : (
					apiKeys.map(e => (
						<APIKeyRow
							apiKeys={apiKeys}
							setApiKeys={setApiKeys}
							key={e.token}
							apiKey={e}
						/>
					))
				)}
			</div>
			<Divider />
			<div className="row justify-content-center">
				<button className="btn btn-primary" onClick={() => setShowModal(true)}>
					Create new API Key
				</button>
			</div>
			<CreateAPIKeyModal {...{ showModal, setShowModal, reqUser, setApiKeys, apiKeys }} />
		</>
	);
}

function CreateAPIKeyModal({
	showModal,
	setShowModal,
	reqUser,
	apiKeys,
	setApiKeys,
}: {
	showModal: boolean;
	setShowModal: SetState<boolean>;
	reqUser: PublicUserDocument;
	apiKeys: APITokenDocument[];
	setApiKeys: SetState<APITokenDocument[]>;
}) {
	const [identifier, setIdentifier] = useState("My API Key");
	const [permissions, setPermissions] = useState<APIPermissions[]>([]);

	return (
		<Modal show={showModal} onHide={() => setShowModal(false)}>
			<Modal.Header>Create API Key</Modal.Header>
			<Modal.Body>
				<form
					onSubmit={async e => {
						e.preventDefault();
						const res = await APIFetchV1<APITokenDocument>(
							`/users/${reqUser.id}/api-tokens/create`,
							{
								method: "POST",
								headers: {
									"Content-Type": "application/json",
								},
								body: JSON.stringify({
									permissions,
									identifier,
								}),
							},
							true,
							true
						);

						if (res.success) {
							setApiKeys([...apiKeys, res.body]);
							setShowModal(false);
						}
					}}
				>
					<div className="input-group">
						<div className="input-group-append">
							<span className="input-group-text">Identifier</span>
						</div>
						<input
							value={identifier}
							className="form-control"
							onChange={e => setIdentifier(e.target.value)}
						/>
					</div>
					<Muted>Give your API Key a name, so you dont forget what it's for!</Muted>
					<Divider />
					<h4>Permissions</h4>
					<div className="px-4">
						{allPermissions.map(permission => (
							<>
								<input
									key={permission}
									className="form-check-input"
									type="checkbox"
									onChange={e => {
										if (e.target.checked) {
											setPermissions([...permissions, permission]);
										} else {
											setPermissions(
												permissions.filter(e => e !== permission)
											);
										}
									}}
								/>
								<label className="form-check-label">{permission}</label>
								<br />
							</>
						))}
					</div>

					<Divider />
					<button type="submit" className="btn btn-success">
						Create Key
					</button>
				</form>
			</Modal.Body>
		</Modal>
	);
}

function APIKeyRow({
	apiKey,
	setApiKeys,
	apiKeys,
}: {
	apiKey: APITokenDocument;
	apiKeys: APITokenDocument[];
	setApiKeys: SetState<APITokenDocument[]>;
}) {
	const [show, setShow] = useState(false);
	const [sure, setSure] = useState(false);

	return (
		<div className="col-12">
			<Divider />
			<h4>{apiKey.identifier}</h4>
			{show ? (
				<code style={{ fontSize: "2rem" }}>{apiKey.token}</code>
			) : (
				<code style={{ fontSize: "2rem" }} onClick={() => setShow(true)}>
					Sensitive Information. Click to reveal.
				</code>
			)}
			<h5>Permissions: {Object.keys(apiKey.permissions).join(", ")}</h5>
			<Button
				onClick={async () => {
					if (!sure) {
						setSure(true);
					} else {
						await APIFetchV1(
							`/users/${apiKey.userID}/api-tokens/${apiKey.token}`,
							{
								method: "DELETE",
							},
							true,
							true
						);

						setApiKeys(apiKeys.filter(e => e.token !== apiKey.token));
					}
				}}
				className="float-right"
				variant="danger"
			>
				{sure ? "Are you really sure?" : "Delete Key"}
			</Button>
		</div>
	);
}
