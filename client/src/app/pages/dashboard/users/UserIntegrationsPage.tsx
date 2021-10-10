import Card from "components/layout/page/Card";
import ApiError from "components/util/ApiError";
import DebugContent from "components/util/DebugContent";
import Divider from "components/util/Divider";
import Icon from "components/util/Icon";
import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import SelectButton from "components/util/SelectButton";
import { TachiConfig } from "lib/config";
import React, { useEffect, useState } from "react";
import { Alert, Button, Col, Row } from "react-bootstrap";
import { APITokenDocument, PublicUserDocument } from "tachi-common";
import { SetState } from "types/react";
import { APIFetchV1 } from "util/api";

export default function UserIntegrationsPage({ reqUser }: { reqUser: PublicUserDocument }) {
	const [page, setPage] = useState<"services" | "api-keys">("services");

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
					{page === "services" ? <div>hey</div> : <APIKeysPage reqUser={reqUser} />}
				</Col>
			</Row>
		</Card>
	);
}

function APIKeysPage({ reqUser }: { reqUser: PublicUserDocument }) {
	const [apiKeys, setApiKeys] = useState<APITokenDocument[]>([]);

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
		</>
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
