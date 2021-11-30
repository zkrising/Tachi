import useSetSubheader from "components/layout/header/useSetSubheader";
import SessionOverview from "components/sessions/SessionOverview";
import SessionRaiseBreakdown from "components/sessions/SessionRaiseBreakdown";
import ScoreTable from "components/tables/scores/ScoreTable";
import ApiError from "components/util/ApiError";
import Divider from "components/util/Divider";
import FormInput from "components/util/FormInput";
import Icon from "components/util/Icon";
import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import SelectButton from "components/util/SelectButton";
import { UserContext } from "context/UserContext";
import React, { useContext, useMemo, useState } from "react";
import { Badge, Button, Col, Form, Modal, Row } from "react-bootstrap";
import { Redirect, useParams } from "react-router-dom";
import { GetGameConfig, PublicUserDocument, SessionDocument } from "tachi-common";
import { SessionReturns } from "types/api-returns";
import { GamePT, SetState } from "types/react";
import { APIFetchV1 } from "util/api";
import { CreateChartMap, CreateScoreIDMap, CreateSongMap } from "util/data";
import { DelayedPageReload } from "util/misc";

type Props = { reqUser: PublicUserDocument } & GamePT;

export default function SpecificSessionPage({ reqUser, game, playtype }: Props) {
	const { sessionID } = useParams<{ sessionID: string }>();

	const { data, isLoading, error } = useApiQuery<SessionReturns>(`/sessions/${sessionID}`);

	if (error) {
		return <ApiError error={error} />;
	}

	if (isLoading || !data) {
		return <Loading />;
	}

	if (
		data.user.id !== reqUser.id ||
		game !== data.session.game ||
		playtype !== data.session.playtype
	) {
		return (
			<Redirect
				to={`/dashboard/users/${data.user.username}/games/${data.session.game}/${data.session.playtype}/sessions/${sessionID}`}
			/>
		);
	}

	return <SessionPage {...{ data, game, playtype, reqUser }} />;
}

function SessionPage({ data, game, playtype }: Props & { data: SessionReturns }) {
	const { session, user, charts, scores, songs } = data;

	const { user: loggedInUser } = useContext(UserContext);

	useSetSubheader(
		[
			"Users",
			user.username,
			"Games",
			GetGameConfig(game).name,
			playtype,
			"Sessions",
			session.name,
		],
		[session.name, game, playtype, user],
		`${user.username}: ${session.name}`
	);

	const [view, setView] = useState<"raises" | "overview" | "scores">("overview");

	const songMap = CreateSongMap(songs);
	const chartMap = CreateChartMap(charts);
	const scoreMap = CreateScoreIDMap(scores);

	const scoreDataset = useMemo(() => {
		const d = [];

		for (const scoreInfo of session.scoreInfo) {
			const score = scoreMap.get(scoreInfo.scoreID);

			if (!score) {
				console.error(`No score for scoreID ${scoreInfo.scoreID}, but one was in session?`);
				continue;
			}

			const chart = chartMap.get(score.chartID);
			const song = songMap.get(score.songID);

			if (!chart || !song) {
				console.error(`No chart for ${score.chartID} (${score.songID})?`);
				continue;
			}

			d.push({
				...score,
				__related: {
					chart,
					song,
					index: 0,
					user,
				},
			});
		}

		return d;
	}, [data]);

	const [highlight, setHighlight] = useState(session.highlight);
	const [showEditModal, setShowEditModal] = useState(false);

	return (
		<Row className="justify-content-center">
			<Col xs={12} className="text-center">
				<h1>{session.name}</h1>
				<h4 className="text-muted mb-4">{session.desc}</h4>
				<Badge variant="secondary">
					<span
						style={{
							lineHeight: "15px",
							verticalAlign: "middle",
						}}
					>
						<Icon type="eye" style={{ verticalAlign: "middle" }} /> Views:{" "}
						{session.views}
					</span>
				</Badge>
				{session.highlight && (
					<Badge
						style={{
							lineHeight: "15px",
						}}
						variant="warning"
						className="ml-2"
					>
						Highlight!
					</Badge>
				)}

				<Divider className="mt-8 mb-4" />
				{user.id === loggedInUser?.id && (
					<>
						<Button
							variant="outline-info"
							onClick={() => setShowEditModal(true)}
							className="mr-4"
						>
							Edit Session
						</Button>
						{highlight ? (
							<Button
								variant="outline-danger"
								onClick={async () => {
									setHighlight(false);
									session.highlight = false;

									await APIFetchV1(
										`/sessions/${session.sessionID}`,
										{
											method: "PATCH",
											headers: {
												"Content-Type": "application/json",
											},
											body: JSON.stringify({
												highlight: false,
											}),
										},
										true,
										true
									);
								}}
							>
								Un-Highlight Session
							</Button>
						) : (
							<Button
								variant="outline-warning"
								onClick={async () => {
									setHighlight(true);
									session.highlight = true;

									await APIFetchV1(
										`/sessions/${session.sessionID}`,
										{
											method: "PATCH",
											headers: {
												"Content-Type": "application/json",
											},
											body: JSON.stringify({
												highlight: true,
											}),
										},
										true,
										true
									);
								}}
							>
								Highlight Session
							</Button>
						)}
						<Divider />
					</>
				)}
				<div className="btn-group">
					<SelectButton value={view} setValue={setView} id="raises">
						<Icon type="receipt" />
						Raises
					</SelectButton>
					<SelectButton value={view} setValue={setView} id="overview">
						<Icon type="chart-area" />
						Overview
					</SelectButton>
					<SelectButton value={view} setValue={setView} id="scores">
						<Icon type="table" />
						All Scores
					</SelectButton>
				</div>
				<Divider />
			</Col>
			{view === "raises" ? (
				<SessionRaiseBreakdown sessionData={data} />
			) : view === "overview" ? (
				<SessionOverview scoreDataset={scoreDataset} sessionData={data} />
			) : (
				<Col xs={12}>
					<ScoreTable
						dataset={scoreDataset}
						game={session.game}
						playtype={session.playtype}
					/>
				</Col>
			)}
			{showEditModal && (
				<EditModal session={session} show={showEditModal} setShow={setShowEditModal} />
			)}
		</Row>
	);
}

function EditModal({
	session,
	show,
	setShow,
}: {
	session: SessionDocument;
	show: boolean;
	setShow: SetState<boolean>;
}) {
	const [name, setName] = useState(session.name);
	const [desc, setDesc] = useState(session.desc ?? "No Description...");

	return (
		<Modal show={show} onHide={() => setShow(false)}>
			<Modal.Header closeButton>
				<Modal.Title>Edit Comment</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form
					onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
						e.preventDefault();

						const r = await APIFetchV1(
							`/sessions/${session.sessionID}`,
							{
								method: "PATCH",
								headers: {
									"Content-Type": "application/json",
								},
								body: JSON.stringify({
									name,
									desc,
								}),
							},
							true,
							true
						);

						if (r.success) {
							DelayedPageReload();
						}
					}}
				>
					<FormInput fieldName="Session Name" value={name} setValue={setName} />
					<Divider />
					<FormInput
						fieldName="Session Description"
						value={desc ?? ""}
						setValue={setDesc as SetState<string>}
					/>
					<Divider />
					<Button type="submit">Submit</Button>
				</Form>
			</Modal.Body>
		</Modal>
	);
}
