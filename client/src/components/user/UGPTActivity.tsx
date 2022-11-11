import { CreateUserMap } from "util/data";
import { NO_OP, TruncateString } from "util/misc";
import { FormatTime, MillisToSince } from "util/time";
import { ONE_HOUR } from "util/constants/time";
import SessionRaiseBreakdown from "components/sessions/SessionRaiseBreakdown";
import ScoreTable from "components/tables/scores/ScoreTable";
import ApiError from "components/util/ApiError";
import Divider from "components/util/Divider";
import Icon from "components/util/Icon";
import LinkButton from "components/util/LinkButton";
import Loading from "components/util/Loading";
import Muted from "components/util/Muted";
import useApiQuery from "components/util/query/useApiQuery";
import React, { useState } from "react";
import { Col, Row } from "react-bootstrap";
import { FormatChart, SessionDocument, UserDocument } from "tachi-common";
import { SessionReturns } from "types/api-returns";
import { ScoreDataset } from "types/tables";
import { ClumpedActivity, ClumpedActivityScores } from "types/tachi";

// Records activity for a group of users on a GPT. Also used for single users.
export default function UGPTActivity({
	data,
	users,
}: {
	data: ClumpedActivity;
	users: Array<UserDocument>;
}) {
	const userMap = CreateUserMap(users);

	if (data.length === 0) {
		return (
			<Col xs={12} className="text-center">
				We found no activity!
			</Col>
		);
	}

	return (
		<Col xs={12} className="text-center">
			<div className="timeline timeline-2">
				<div className="timeline-bar"></div>
				{data.map((e) => {
					const user = userMap.get(e.type === "SCORES" ? e.scores[0]?.userID : e.userID);

					if (!user) {
						return <div>This user doesn't exist? Whoops.</div>;
					}

					return e.type === "SCORES" ? (
						<ScoresActivity data={e} user={user} />
					) : (
						<SessionActivity data={e} user={user} />
					);
				})}
				<div className="timeline-item">
					<div className="timeline-item">
						<div className="timeline-badge bg-success"></div>
						<div
							className="timeline-content d-flex"
							style={{
								flexDirection: "column",
								flexWrap: "wrap",
								marginRight: "2rem",
							}}
						>
							...
						</div>
					</div>
				</div>
			</div>
		</Col>
	);
}

function ScoresActivity({ data, user: user }: { data: ClumpedActivityScores; user: UserDocument }) {
	const { game, playtype } = data.scores[0];

	const [show, setShow] = useState(false);

	let subMessage;
	let mutedText: string | null | undefined;

	if (data.scores.length === 1) {
		const score0 = data.scores[0];

		subMessage = `a score on ${FormatChart(
			score0.game,
			score0.__related.song,
			score0.__related.chart
		)}`;

		if (score0.comment) {
			mutedText = `"${score0.comment}"`;
		}
	} else {
		subMessage = `${data.scores.length} scores`;

		mutedText = TruncateString(
			data.scores
				.map((e) => FormatChart(e.game, e.__related.song, e.__related.chart))
				.join(", "),
			100
		);
	}

	const dataset: ScoreDataset = data.scores.map((e, i) => ({
		...e,
		__related: {
			...e.__related,
			index: i,
			user,
		},
	}));

	return (
		<div className="timeline-item timeline-hover my-4">
			<div className="timeline-badge bg-warning"></div>
			<div
				className="timeline-content d-flex"
				style={{
					flexDirection: "column",
					flexWrap: "wrap",
					marginRight: "2rem",
				}}
			>
				<div
					className="d-flex align-items-center justify-content-between"
					onClick={() => setShow(!show)}
				>
					<div className="mr-3" style={{ width: "70%", textAlign: "left" }}>
						<Icon
							type={`chevron-${show ? "down" : "right"}`}
							style={{
								fontSize: "0.75rem",
							}}
						/>
						<span style={{ fontSize: "1.15rem" }} className="ml-2">
							{user.username} highlighted {subMessage}!
						</span>
						{mutedText && (
							<>
								<br />
								<Muted>{mutedText}</Muted>
							</>
						)}
					</div>

					<div style={{ textAlign: "right" }}>
						{MillisToSince(data.scores[0].timeAchieved ?? 0)}
						<br />
						<span className="text-muted font-italic text-right">
							{FormatTime(data.scores[0].timeAchieved ?? 0)}
						</span>
					</div>
				</div>

				{show && (
					<>
						<Divider />
						<ScoreTable
							noTopDisplayStr
							dataset={dataset}
							game={game}
							playtype={playtype}
						/>
					</>
				)}
			</div>
		</div>
	);
}

function SessionActivity({
	data,
	user: rival,
}: {
	data: { type: "SESSION" } & SessionDocument;
	user: UserDocument;
}) {
	const [show, setShow] = useState(false);

	const isProbablyActive = Date.now() - data.timeEnded < ONE_HOUR;

	return (
		<div className="timeline-item timeline-hover">
			<div className="timeline-badge bg-secondary"></div>
			<div
				className="timeline-content d-flex"
				style={{
					flexDirection: "column",
					flexWrap: "wrap",
					marginRight: "2rem",
				}}
			>
				<div
					className="d-flex align-items-center justify-content-between"
					onClick={() => setShow(!show)}
				>
					<div className="mr-3" style={{ width: "70%", textAlign: "left" }}>
						<Icon
							type={`chevron-${show ? "down" : "right"}`}
							style={{
								fontSize: "0.75rem",
							}}
						/>
						<span
							className="ml-2"
							style={{
								fontWeight: isProbablyActive ? "bold" : undefined,
								fontSize: isProbablyActive ? "1.2rem" : undefined,
							}}
						>
							{rival.username} {isProbablyActive ? "is having" : "had"} a session '
							{data.name}' with {data.scoreInfo.length}{" "}
							{data.scoreInfo.length === 1 ? "score" : "scores"}.
						</span>
						<br />
						{data.desc && data.desc !== "This session has no description." && (
							<span className="text-muted">{data.desc}</span>
						)}
					</div>

					<div style={{ textAlign: "right" }} className="mr-1">
						{MillisToSince(data.timeStarted ?? 0)}
						<br />
						<span className="text-muted font-italic text-right">
							{FormatTime(data.timeStarted ?? 0)}
						</span>
					</div>
				</div>
				{show && <SessionShower sessionID={data.sessionID} />}
			</div>
		</div>
	);
}

function SessionShower({ sessionID }: { sessionID: string }) {
	const { data, error } = useApiQuery<SessionReturns>(`/sessions/${sessionID}`);

	if (error) {
		return <ApiError error={error} />;
	}

	if (!data) {
		return <Loading />;
	}

	return (
		<Row>
			<SessionRaiseBreakdown sessionData={data} setScores={NO_OP} />
			<Col xs={12}>
				<Divider />
			</Col>
			<div className="d-flex w-100 justify-content-center">
				<LinkButton
					className="btn-outline-primary"
					to={`/dashboard/users/${data.user.username}/games/${data.session.game}/${data.session.playtype}/sessions/${sessionID}`}
				>
					View Full Session
				</LinkButton>
			</div>
		</Row>
	);
}
