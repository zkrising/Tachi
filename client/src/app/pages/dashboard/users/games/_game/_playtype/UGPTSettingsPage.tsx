import useSetSubheader from "components/layout/header/useSetSubheader";
import Card from "components/layout/page/Card";
import Divider from "components/util/Divider";
import Icon from "components/util/Icon";
import SelectButton from "components/util/SelectButton";
import { UGPTSettingsContext } from "context/UGPTSettingsContext";
import deepmerge from "deepmerge";
import { useFormik } from "formik";
import React, { useContext, useState } from "react";
import { Button, Form } from "react-bootstrap";
import {
	FormatGame,
	GetGameConfig,
	GetGamePTConfig,
	PublicUserDocument,
	UGPTSettings,
} from "tachi-common";
import { GamePT } from "types/react";
import { APIFetchV1 } from "util/api";
import { DelayedPageReload } from "util/misc";

type Props = { reqUser: PublicUserDocument } & GamePT;

export default function UGPTSettingsPage({ reqUser, game, playtype }: Props) {
	const [page, setPage] = useState<"preferences" | "showcase">("preferences");
	const gameConfig = GetGameConfig(game);

	useSetSubheader(
		["Users", reqUser.username, "Games", gameConfig.name, playtype, "Settings"],
		[reqUser],
		`${reqUser.username}'s ${FormatGame(game, playtype)} Settings`
	);

	const props = { reqUser, game, playtype };

	return (
		<Card header="Settings" className="col-12 offset-lg-2 col-lg-8">
			<div className="row">
				<div className="col-12 d-flex justify-content-center">
					<div className="btn-group">
						<SelectButton value={page} setValue={setPage} id="preferences">
							<Icon type="cogs" />
							Preferences
						</SelectButton>
						<SelectButton value={page} setValue={setPage} id="showcase">
							<Icon type="bars" />
							Showcase Stats
						</SelectButton>
					</div>
				</div>
				<div className="col-12">
					<Divider className="mt-4 mb-4" />
					{page === "preferences" ? (
						<PreferencesForm {...props} />
					) : (
						<ShowcaseForm {...props} />
					)}
				</div>
			</div>
		</Card>
	);
}

function PreferencesForm({ reqUser, game, playtype }: Props) {
	const { settings, setSettings } = useContext(UGPTSettingsContext);

	const gptConfig = GetGamePTConfig(game, playtype);

	const formik = useFormik({
		initialValues: {
			preferredScoreAlg:
				settings!.preferences.preferredScoreAlg || gptConfig.defaultScoreRatingAlg,
			preferredProfileAlg:
				settings!.preferences.preferredProfileAlg || gptConfig.defaultProfileRatingAlg,
			preferredSessionAlg:
				settings!.preferences.preferredSessionAlg || gptConfig.defaultSessionRatingAlg,
		},
		onSubmit: async values => {
			const rj = await APIFetchV1<PublicUserDocument>(
				`/users/${reqUser.id}/games/${game}/${playtype}/settings`,
				{
					method: "PATCH",
					body: JSON.stringify(values),
					headers: {
						"Content-Type": "application/json",
					},
				},
				true,
				true
			);

			if (rj.success) {
				setSettings(deepmerge(settings as UGPTSettings, { preferences: values }));
			}
		},
	});

	return (
		<Form onSubmit={formik.handleSubmit}>
			<Form.Group>
				<Form.Label>Preferred Score Algorithm</Form.Label>
				<Form.Control
					as="select"
					id="preferredScoreAlg"
					value={formik.values.preferredScoreAlg}
					onChange={formik.handleChange}
				>
					{gptConfig.scoreRatingAlgs.map(e => (
						<option key={e}>{e}</option>
					))}
				</Form.Control>
				<Form.Text className="text-muted">
					This configures the default rating algorithm to display for scores. This is used
					for things like score tables and PB tables.
				</Form.Text>
			</Form.Group>
			<Form.Group>
				<Form.Label>Preferred Session Algorithm</Form.Label>
				<Form.Control
					as="select"
					id="preferredSessionAlg"
					value={formik.values.preferredSessionAlg}
					onChange={formik.handleChange}
				>
					{gptConfig.sessionRatingAlgs.map(e => (
						<option key={e}>{e}</option>
					))}
				</Form.Control>
				<Form.Text className="text-muted">
					This configures the default rating algorithm to display for sessions. This is
					used for things like session tables.
				</Form.Text>
			</Form.Group>
			<Form.Group>
				<Form.Label>Preferred Profile Algorithm</Form.Label>
				<Form.Control
					as="select"
					id="preferredProfileAlg"
					value={formik.values.preferredProfileAlg}
					onChange={formik.handleChange}
				>
					{gptConfig.profileRatingAlgs.map(e => (
						<option key={e}>{e}</option>
					))}
				</Form.Control>
				<Form.Text className="text-muted">
					This configures the default rating algorithm to display for profiles. This is
					used for things like leaderboards.
				</Form.Text>
			</Form.Group>
			<div className="row justify-content-center">
				<Button type="submit" variant="success">
					Save Changes
				</Button>
			</div>
		</Form>
	);
}

function ShowcaseForm({ reqUser, game, playtype }: Props) {
	return <></>;
}
