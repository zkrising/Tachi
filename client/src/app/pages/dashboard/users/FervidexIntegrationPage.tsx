import { APIFetchV1 } from "util/api";
import ApiError from "components/util/ApiError";
import Divider from "components/util/Divider";
import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import React, { useState } from "react";
import { Button, Col, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FervidexSettingsDocument, PublicUserDocument } from "tachi-common";

export default function FervidexIntegrationPage({ reqUser }: { reqUser: PublicUserDocument }) {
	const { data: settings, isLoading, error } = useApiQuery<FervidexSettingsDocument | null>(
		`/users/${reqUser.id}/integrations/fervidex/settings`
	);

	if (error) {
		return <ApiError error={error} />;
	}

	if (isLoading || settings === undefined) {
		return <Loading />;
	}

	return (
		<>
			<Col xs={12}>
				<h4>Fervidex Integration</h4>
				<span>
					Fervidex is a Score-Importing Hook for IIDX. Configuring it is as simple as
					dropping a <code>.dll</code> and config file into your game folder.
				</span>
			</Col>
			<Col xs={12} className="mt-4">
				Instructions on how to setup fervidex can be found{" "}
				<Link to="/dashboard/import/fervidex">here</Link>.
				<Divider />
			</Col>
			<Col xs={12} className="mt-4">
				<h4 className="mb-4">Advanced Settings</h4>
				<FervidexForm {...{ reqUser, settings }} />
			</Col>
		</>
	);
}

function FervidexForm({
	reqUser,
	settings,
}: {
	reqUser: PublicUserDocument;
	settings: FervidexSettingsDocument | null;
}) {
	const [formSettings, setFormSettings] = useState<Omit<FervidexSettingsDocument, "userID">>(
		settings
			? { forceStaticImport: settings.forceStaticImport, cards: settings.cards }
			: {
					forceStaticImport: false,
					cards: null,
			  }
	);

	return (
		<form
			className="text-left"
			onSubmit={async e => {
				e.preventDefault();

				if (formSettings.cards?.length === 0) {
					setFormSettings({ ...formSettings, cards: null });
				}

				await APIFetchV1(
					`/users/${reqUser.id}/integrations/fervidex/settings`,
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
					onChange={e => {
						setFormSettings({ ...formSettings, forceStaticImport: e.target.checked });
					}}
					label="Force Static Imports"
				/>
				<Form.Text>
					Import scores on game load for non-INFINITAS IIDX versions.
					<br />
					<span className="text-warning">
						Warning: You should always import from your network first. Statically
						imported scores have the bare minimum data (Lamp + EX Score + BP), but due
						to score de-duplication rules, future network imports cannot append more
						data (Timestamps, Graphs, etc.) to these scores.
					</span>
				</Form.Text>
			</Form.Group>
			{formSettings.cards === null ? (
				<Button
					variant="info"
					onClick={() => setFormSettings({ ...formSettings, cards: [] })}
				>
					Enable Card Filters
				</Button>
			) : (
				<>
					<Button
						variant="danger"
						onClick={() => setFormSettings({ ...formSettings, cards: null })}
					>
						Disable Card Filters
					</Button>

					<Form.Group>
						<Form.Label>
							Your Card ID. You can specify multiple by separating them with spaces.
							<br />
							<span className="text-warning">
								Warning: CardIDs are the ones that <b>DON'T</b> start with E004.
							</span>
						</Form.Label>
						<Form.Control
							value={formSettings.cards.join(" ")}
							onChange={e => {
								setFormSettings({
									...formSettings,
									cards: e.target.value.split(" ").map(e => e.toUpperCase()),
								});
							}}
						/>
						{formSettings.cards.some(c => !isCardIDValid(c)) && (
							<div className="text-danger">
								CardIDs should be 16 characters, or a <code>C</code> followed by 12
								characters!
							</div>
						)}
						{formSettings.cards.some(x => x.startsWith("E004")) && (
							<div className="text-danger">
								CardIDs are <b>NOT</b> the ones that start with E004!
							</div>
						)}
					</Form.Group>
				</>
			)}

			<Form.Text>
				This will restrict score uploads from your API key to only those from this set of
				cards. You should only use this if multiple people will play on your setup.
				<br />
				<span className="text-warning">
					Warning: If you play on INFINITAS and other versions, you will need to set both
					cardIDs here!
				</span>
			</Form.Text>

			<div className="d-flex justify-content-center">
				<Button variant="primary" className="mt-4" type="submit">
					Submit Settings
				</Button>
			</div>
		</form>
	);
}

function isCardIDValid(cardID: string) {
	if (cardID.startsWith("E004")) {
		return false;
	}

	if (cardID[0] === "C") {
		return cardID.length === 13;
	}

	return cardID.length === 16;
}
