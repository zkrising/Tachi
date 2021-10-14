import useSetSubheader from "components/layout/header/useSetSubheader";
import Card from "components/layout/page/Card";
import ApiError from "components/util/ApiError";
import Divider from "components/util/Divider";
import Icon from "components/util/Icon";
import Loading from "components/util/Loading";
import Muted from "components/util/Muted";
import useApiQuery from "components/util/query/useApiQuery";
import SelectButton from "components/util/SelectButton";
import { mode, TachiConfig } from "lib/config";
import React, { useEffect, useState } from "react";
import { Alert, Button, Col, Modal, Row, Form } from "react-bootstrap";
import { APIPermissions, APITokenDocument, PublicUserDocument } from "tachi-common";
import { SetState } from "types/react";
import { APIFetchV1 } from "util/api";
import { allPermissions } from "util/misc";
import FervidexIntegrationPage from "./FervidexIntegrationPage";

export default function UserIntegrationsPage({ reqUser }: { reqUser: PublicUserDocument }) {
	const [page, setPage] = useState<"services" | "api-keys">("services");

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
						<SelectButton value={page} setValue={setPage} id="services">
							<Icon type="network-wired" />
							Integrations
						</SelectButton>
						<SelectButton value={page} setValue={setPage} id="api-keys">
							<Icon type="key" />
							API Keys
						</SelectButton>
					</div>
					<Divider />
				</Col>
				<Col xs={12}>
					{page === "services" ? (
						<IntegrationsPage reqUser={reqUser} />
					) : (
						<APIKeysPage reqUser={reqUser} />
					)}
				</Col>
			</Row>
		</Card>
	);
}

function IntegrationsPage({ reqUser }: { reqUser: PublicUserDocument }) {
	if (mode === "btchi") {
		return (
			<Row className="text-center">
				Looks like there's no services available for integration.
			</Row>
		);
	}

	const [page, setPage] = useState<"fervidex" | "arc" | "flo" | "eag" | "min">("fervidex");

	return (
		<>
			<Row className="text-center justify-content-center">
				<Col xs={12}>
					<h3>Services</h3>
					<Muted>
						Some services have had their names truncated to their first three characters
						for privacy reasons.
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
				{page === "fervidex" ? <FervidexIntegrationPage reqUser={reqUser} /> : <></>}
			</Row>
		</>
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
				<code style={{ fontSize: "2rem" }} onClick={() => setShow(false)}>
					{apiKey.token}
				</code>
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
