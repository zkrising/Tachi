import { APIFetchV1 } from "util/api";
import ApiError from "components/util/ApiError";
import Divider from "components/util/Divider";
import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import React, { useState } from "react";
import { Button, Col, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FervidexSettingsDocument, KsHookSettingsDocument, PublicUserDocument } from "tachi-common";

export default function KsHookSV6CIntegrationPage({ reqUser }: { reqUser: PublicUserDocument }) {
	const { data: settings, error } = useApiQuery<FervidexSettingsDocument | null>(
		`/users/${reqUser.id}/integrations/kshook-sv6c/settings`
	);

	if (error) {
		return <ApiError error={error} />;
	}

	if (settings === undefined) {
		return <Loading />;
	}

	return (
		<>
			<Col xs={12}>
				<h4>KsHook Integration</h4>
				<span>
					KsHook is a Score-Importing Hook for SOUND VOLTEX EA-CLOUD. Configuring it is as
					simple as dropping a <code>.dll</code> and config file into your game folder.
				</span>
			</Col>
			<Col xs={12} className="mt-4">
				Instructions on how to setup the KsHook can be found{" "}
				<Link to="/dashboard/import/kshook">here</Link>.
				<Divider />
			</Col>
			<Col xs={12} className="mt-4">
				<h4 className="mb-4">Advanced Settings</h4>
				<KsHookSV6CForm {...{ reqUser, settings }} />
			</Col>
		</>
	);
}

function KsHookSV6CForm({
	reqUser,
	settings,
}: {
	reqUser: PublicUserDocument;
	settings: KsHookSettingsDocument | null;
}) {
	const [formSettings, setFormSettings] = useState<Omit<KsHookSettingsDocument, "userID">>(
		settings ? { forceStaticImport: settings.forceStaticImport } : { forceStaticImport: false }
	);

	return (
		<form
			className="text-left"
			onSubmit={async (e) => {
				e.preventDefault();

				await APIFetchV1(
					`/users/${reqUser.id}/integrations/kshook-sv6c/settings`,
					{
						method: "PATCH",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(formSettings),
					},
					true,
					true
				);
			}}
		>
			<Form.Group>
				<Form.Check
					type="checkbox"
					checked={formSettings.forceStaticImport}
					onChange={(e) => {
						setFormSettings({ ...formSettings, forceStaticImport: e.target.checked });
					}}
					label="Force Static Imports"
				/>
				<Form.Text>
					Import existing scores on game load.
					<br />
					<span className="text-warning">
						Warning: You should always import from your network first. Statically
						imported scores have the bare minimum data (Lamp + EX Score + BP), but due
						to score de-duplication rules, future network imports cannot append more
						data (Timestamps, Graphs, etc.) to these scores.
					</span>
				</Form.Text>
			</Form.Group>

			<div className="d-flex justify-content-center">
				<Button variant="primary" className="mt-4" type="submit">
					Submit Settings
				</Button>
			</div>
		</form>
	);
}
