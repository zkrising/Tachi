import ClassBadge from "components/game/ClassBadge";
import useSetSubheader from "components/layout/header/useSetSubheader";
import Card from "components/layout/page/Card";
import UGPTStatContainer from "components/user/UGPTStatContainer";
import UGPTStatCreator from "components/user/UGPTStatCreator";
import ApiError from "components/util/ApiError";
import Divider from "components/util/Divider";
import Icon from "components/util/Icon";
import Loading from "components/util/Loading";
import Muted from "components/util/Muted";
import useApiQuery from "components/util/query/useApiQuery";
import SelectButton from "components/util/SelectButton";
import useQueryString from "components/util/useQueryString";
import { UGPTSettingsContext } from "context/UGPTSettingsContext";
import deepmerge from "deepmerge";
import { useFormik } from "formik";
import { TachiConfig } from "lib/config";
import React, { useContext, useEffect, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import {
	FormatGame,
	GetGameConfig,
	GetGamePTConfig,
	PublicUserDocument,
	ShowcaseStatDetails,
	TableDocument,
	UGPTSettings,
} from "tachi-common";
import { GamePT, SetState } from "types/react";
import { APIFetchV1 } from "util/api";

type Props = { reqUser: PublicUserDocument } & GamePT;

export default function UGPTSettingsPage({ reqUser, game, playtype }: Props) {
	const query = useQueryString();

	const [page, setPage] = useState<"preferences" | "showcase">(
		query.get("showcase") ? "showcase" : "preferences"
	);
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
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			gameSpecific: settings!.preferences.gameSpecific as any,
			defaultTable: settings!.preferences.defaultTable,
			scoreBucket: settings!.preferences.scoreBucket ?? gptConfig.scoreBucket,
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

	const { data: tables, isLoading, error } = useApiQuery<TableDocument[]>(
		`/games/${game}/${playtype}/tables?showInactive=true`
	);

	if (error) {
		return <ApiError error={error} />;
	}

	if (isLoading || !tables) {
		return <Loading />;
	}

	const displayableTables = tables.filter(
		e => !e.inactive || settings?.preferences.defaultTable === e.tableID
	);

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
			<Form.Group>
				<Form.Label>Preferred Score Info</Form.Label>
				<Form.Control
					as="select"
					id="scoreBucket"
					value={formik.values.scoreBucket}
					onChange={formik.handleChange}
				>
					<option value="grade">Score</option>
					<option value="lamp">Lamp</option>
				</Form.Control>
				<Form.Text className="text-muted">
					What should {TachiConfig.name} prefer to show you about scores?
					<br />
					Note: This will only affect defaults, such as what graph is shown in the folder
					breakdown. You can still view all the same stats!
				</Form.Text>
			</Form.Group>
			<Form.Group>
				<Form.Label>Preferred Table</Form.Label>
				<Form.Control
					as="select"
					id="defaultTable"
					value={
						formik.values.defaultTable ??
						tables.find(x => x.default)?.tableID ??
						displayableTables[0].tableID
					}
					onChange={formik.handleChange}
				>
					{displayableTables.map(table => (
						<option key={table.tableID} value={table.tableID}>
							{table.title}
						</option>
					))}
				</Form.Control>
				<Form.Text className="text-muted">
					What folders would you like to see when you go to the folders page by default?
				</Form.Text>
			</Form.Group>
			{game === "iidx" && (
				<>
					<Form.Group>
						<Form.Check
							type="checkbox"
							id="gameSpecific.display2DXTra"
							name="gameSpecific.display2DXTra"
							checked={formik.values.gameSpecific.display2DXTra}
							onChange={formik.handleChange}
							label="Display 2DX-tra Charts"
						/>
						<Form.Text className="text-muted">
							Display 2DX-tra charts on the song page.
						</Form.Text>
					</Form.Group>
					<Form.Group>
						<Form.Label>BPI Target</Form.Label>
						<Form.Control
							type="number"
							id="gameSpecific.bpiTarget"
							name="gameSpecific.bpiTarget"
							value={formik.values.gameSpecific.bpiTarget}
							min={0}
							max={100}
							step={5}
							onChange={formik.handleChange}
						/>
						<Form.Text className="text-muted">
							Set yourself a BPI target. {TachiConfig.name} will show how far away you
							are from it in the UI!
						</Form.Text>
					</Form.Group>
				</>
			)}
			{(game === "sdvx" || game === "usc") && (
				<Form.Group>
					<Form.Label>VF6 Target</Form.Label>
					<Row>
						<Col xs={12} lg={9}>
							<Form.Control
								type="number"
								id="gameSpecific.vf6Target"
								name="gameSpecific.vf6Target"
								value={formik.values.gameSpecific.vf6Target}
								min={0}
								max={0.5}
								step={0.001}
								onChange={formik.handleChange}
							/>
						</Col>
						<Col xs={12} lg={3} className="my-auto">
							Expected Profile VF6{" "}
							{((formik.values.gameSpecific.vf6Target ?? 0) * 50).toFixed(2)}
							<br />
							<ClassBadge
								game="sdvx"
								playtype="Single"
								classSet="vfClass"
								classValue={ToVolforceClass(
									(formik.values.gameSpecific.vf6Target ?? 0) * 50
								)}
							/>
						</Col>
					</Row>

					<Form.Text className="text-muted">
						Set yourself a VF6 target. {TachiConfig.name} will show how far away you are
						from it in the UI!
						<br />
						Set this to 0 to disable the target.
					</Form.Text>
				</Form.Group>
			)}
			<div className="row justify-content-center">
				<Button type="submit" variant="success">
					Save Changes
				</Button>
			</div>
		</Form>
	);
}

function ShowcaseForm({ reqUser, game, playtype }: Props) {
	const { settings, setSettings } = useContext(UGPTSettingsContext);

	const [stats, setStats] = useState(settings!.preferences.stats);
	const [show, setShow] = useState(false);

	const SaveChanges = async () => {
		const r = await APIFetchV1<UGPTSettings>(
			`/users/${reqUser.id}/games/${game}/${playtype}/showcase`,
			{
				method: "PUT",
				body: JSON.stringify(stats),
				headers: { "Content-Type": "application/json" },
			},
			true,
			true
		);

		if (r.success) {
			setSettings(r.body);
		}
	};

	const [isFirstPaint, setIsFirstPaint] = useState(true);

	useEffect(() => {
		if (isFirstPaint) {
			setIsFirstPaint(false);
		} else {
			SaveChanges();
		}
	}, [stats]);

	return (
		<div className="row">
			{stats.length < 6 && (
				<div className="col-12">
					<div className="row justify-content-center align-items-center mt-4">
						<Button variant="info" onClick={() => setShow(true)}>
							Add Statistic
						</Button>
					</div>
				</div>
			)}
			<RenderCurrentStats {...{ reqUser, game, playtype, stats, setStats }} />
			<UGPTStatCreator
				game={game}
				playtype={playtype}
				show={show}
				setShow={setShow}
				reqUser={reqUser}
				onCreate={stat => {
					setStats([...stats, stat]);
				}}
			/>
		</div>
	);
}

function RenderCurrentStats({
	stats,
	setStats,
	reqUser,
	game,
	playtype,
}: {
	stats: ShowcaseStatDetails[];
	setStats: SetState<ShowcaseStatDetails[]>;
} & Props) {
	function RemoveStatAtIndex(index: number) {
		setStats(stats.filter((e, i) => i !== index));
	}

	if (stats.length === 0) {
		return (
			<div className="w-100 text-center">
				<Muted>You have no stats set, Why not set some?</Muted>
			</div>
		);
	}

	return (
		<>
			{stats.map((e, i) => (
				<div key={i} className="col-12 col-lg-6">
					<UGPTStatContainer stat={e} reqUser={reqUser} game={game} playtype={playtype} />
					<div className="row justify-content-center mt-4">
						<Button variant="danger" onClick={() => RemoveStatAtIndex(i)}>
							Delete
						</Button>
					</div>
				</div>
			))}
		</>
	);
}

// Straight up stolen from tachi-server.
enum SDVXVFClasses {
	SIENNA_I,
	SIENNA_II,
	SIENNA_III,
	SIENNA_IV,
	COBALT_I,
	COBALT_II,
	COBALT_III,
	COBALT_IV,
	DANDELION_I,
	DANDELION_II,
	DANDELION_III,
	DANDELION_IV,
	CYAN_I,
	CYAN_II,
	CYAN_III,
	CYAN_IV,
	SCARLET_I,
	SCARLET_II,
	SCARLET_III,
	SCARLET_IV,
	CORAL_I,
	CORAL_II,
	CORAL_III,
	CORAL_IV,
	ARGENTO_I,
	ARGENTO_II,
	ARGENTO_III,
	ARGENTO_IV,
	ELDORA_I,
	ELDORA_II,
	ELDORA_III,
	ELDORA_IV,
	CRIMSON_I,
	CRIMSON_II,
	CRIMSON_III,
	CRIMSON_IV,
	IMPERIAL_I,
	IMPERIAL_II,
	IMPERIAL_III,
	IMPERIAL_IV,
}

function ToVolforceClass(vf: number) {
	if (vf >= 24) {
		return SDVXVFClasses.IMPERIAL_IV;
	} else if (vf >= 20) {
		// imperial i -> iv has gaps of 1
		return SDVXVFClasses.IMPERIAL_I + Math.floor(vf - 20);
	} else if (vf >= 14) {
		// cyan i -> crimson iv has gaps of 0.25
		return SDVXVFClasses.CYAN_I + Math.floor(4 * (vf - 14));
	} else if (vf >= 10) {
		// cobalt i -> dandelion iv have gaps of 0.5
		return SDVXVFClasses.COBALT_I + Math.floor(2 * (vf - 10));
	}

	return Math.floor(vf / 2.5);
}
