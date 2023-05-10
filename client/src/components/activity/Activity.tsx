import { ClumpActivity, GetUsers } from "util/activity";
import { APIFetchV1 } from "util/api";
import { ONE_HOUR } from "util/constants/time";
import { CreateScoreIDMap, CreateUserMap } from "util/data";
import { NO_OP, TruncateString } from "util/misc";
import { FormatTime, MillisToSince } from "util/time";
import ClassBadge from "components/game/ClassBadge";
import SessionRaiseBreakdown from "components/sessions/SessionRaiseBreakdown";
import ScoreTable from "components/tables/scores/ScoreTable";
import ApiError from "components/util/ApiError";
import Divider from "components/util/Divider";
import Icon from "components/util/Icon";
import LinkButton from "components/util/LinkButton";
import Loading from "components/util/Loading";
import Muted from "components/util/Muted";
import useApiQuery from "components/util/query/useApiQuery";
import { UserContext } from "context/UserContext";
import React, { useContext, useEffect, useState } from "react";
import { Col, Container, Row, Collapse, CloseButton } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
	FormatChart,
	FormatGame,
	GetGamePTConfig,
	GetScoreEnumConfs,
	UserDocument,
} from "tachi-common";
import { ActivityReturn, RecordActivityReturn, SessionReturns } from "types/api-returns";
import { UGPT } from "types/react";
import { ScoreDataset } from "types/tables";
import {
	ClumpedActivity,
	ClumpedActivityClassAchievement,
	ClumpedActivityGoalAchievement,
	ClumpedActivityQuestAchievement,
	ClumpedActivityScores,
	ClumpedActivitySession,
} from "types/tachi";
import { InnerQuestSectionGoal } from "components/targets/quests/Quest";
import { ProfilePictureSmall } from "components/user/ProfilePicture";
import SupporterIcon from "components/util/SupporterIcon";

// Records activity for a group of users on a GPT. Also used for single users.
export default function Activity({
	url,
	handleNoActivity = (
		<Col xs={12} className="text-center">
			We found no activity!
		</Col>
	),
}: {
	url: string;
	handleNoActivity?: React.ReactNode;
}) {
	const [clumped, setClumped] = useState<ClumpedActivity>([]);
	const [users, setUsers] = useState<Array<UserDocument>>([]);
	const [shouldShowGame, setShouldShowGame] = useState(false);
	const [exhausted, setExhausted] = useState(false);

	const { data, error } = useApiQuery<ActivityReturn | RecordActivityReturn>(url);

	useEffect(() => {
		if (!data) {
			setClumped([]);
			setUsers([]);
		} else {
			const newActivity = ClumpActivity(data);

			if (newActivity.filter((e) => e.type === "SESSION").length < 30) {
				setExhausted(true);
			}

			setClumped(newActivity);
			setUsers(GetUsers(data));

			// show game if this is { "iidx:SP": [], "iidx:DP": [] }...
			// to disambiguate
			setShouldShowGame(!("users" in data));
		}
	}, [data]);

	if (error) {
		return <ApiError error={error} />;
	}

	if (!data) {
		return <Loading />;
	}

	if (clumped.length === 0) {
		return <>{handleNoActivity}</>;
	}

	return (
		<ActivityInner
			shouldShowGame={shouldShowGame}
			data={clumped}
			users={users}
			exhausted={exhausted}
			fetchMoreFrom={(start) => {
				APIFetchV1<ActivityReturn | RecordActivityReturn>(`${url}?startTime=${start}`).then(
					(r) => {
						if (r.success) {
							const newActivity = ClumpActivity(r.body);

							if (newActivity.filter((e) => e.type === "SESSION").length < 30) {
								setExhausted(true);
							}

							setClumped([...clumped, ...newActivity]);
							setUsers([...users, ...GetUsers(r.body)]);
						}
					}
				);
			}}
		/>
	);
}

function ActivityInner({
	data,
	users,
	fetchMoreFrom,
	shouldShowGame,
	exhausted,
}: {
	data: ClumpedActivity;
	users: Array<UserDocument>;
	fetchMoreFrom: (start: number) => void;
	shouldShowGame: boolean;
	exhausted: boolean;
}) {
	const userMap = CreateUserMap(users);

	return (
		<Container className="position-relative" id="activity-timeline">
			<div className="timeline-bar" />
			{data.map((e) => {
				const user = userMap.get(e.type === "SCORES" ? e.scores[0]?.userID : e.userID);

				if (!user) {
					return <div>This user doesn't exist? Whoops.</div>;
				}

				switch (e.type) {
					case "SCORES":
						return (
							<ScoresActivity shouldShowGame={shouldShowGame} data={e} user={user} />
						);
					case "SESSION":
						return (
							<SessionActivity shouldShowGame={shouldShowGame} data={e} user={user} />
						);
					case "CLASS_ACHIEVEMENT":
						return (
							<ClassAchievementActivity
								shouldShowGame={shouldShowGame}
								data={e}
								user={user}
							/>
						);
					case "GOAL_ACHIEVEMENTS":
						return (
							<GoalActivity shouldShowGame={shouldShowGame} data={e} user={user} />
						);
					case "QUEST_ACHIEVEMENT":
						return (
							<QuestActivity shouldShowGame={shouldShowGame} data={e} user={user} />
						);
				}
			})}
			<Col className="d-flex py-4 align-items-center" id="timeline-end">
				<div className="timeline-dot align-self-center p-0 bg-success"></div>
				<div className="w-100 align-middle text-center user-select-none">
					{exhausted ? (
						<>No more activity. This is the end of the road!</>
					) : (
						<a
							className="cursor-pointer"
							onClick={() => {
								let lastTimestamp;
								const lastThing = data.at(-1)!;

								switch (lastThing.type) {
									case "SCORES":
										lastTimestamp = lastThing.scores[0]?.timeAchieved;
										break;
									case "CLASS_ACHIEVEMENT":
										lastTimestamp = lastThing.timeAchieved;
										break;
									case "SESSION":
										lastTimestamp = lastThing.timeStarted;
										break;
									case "GOAL_ACHIEVEMENTS":
										lastTimestamp = lastThing.goals[0]?.timeAchieved;
										break;
									case "QUEST_ACHIEVEMENT":
										lastTimestamp = lastThing.sub.timeAchieved;
								}

								if (!lastTimestamp) {
									alert("Failed. What?");
									return;
								}

								fetchMoreFrom(lastTimestamp);
							}}
						>
							Load More...
						</a>
					)}
				</div>
			</Col>
		</Container>
	);
}

function ScoresActivity({
	data,
	user,
	shouldShowGame,
}: {
	data: ClumpedActivityScores;
	user: UserDocument;
	shouldShowGame: boolean;
}) {
	const { game, playtype } = data.scores[0];

	const prettyGame = shouldShowGame ? `${FormatGame(game, playtype)} ` : "";

	const [active, setActive] = useState(false);
	const [open, setOpen] = useState(false);

	const handleClick = () => {
		setOpen(!open);
		setActive(true);
	};

	let subMessage;
	let mutedText: string | null | undefined;

	if (data.scores.length === 1) {
		const score0 = data.scores[0];

		subMessage = `a ${prettyGame}score on ${FormatChart(
			score0.game,
			score0.__related.song,
			score0.__related.chart,
			true
		)}`;

		if (score0.comment) {
			mutedText = `"${score0.comment}"`;
		}
	} else {
		subMessage = `${data.scores.length} ${prettyGame}scores`;

		mutedText = TruncateString(
			data.scores
				.map((e) => FormatChart(e.game, e.__related.song, e.__related.chart, true))
				.join(", "),
			72
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
		<>
			<Row
				id="score-activity"
				className={`align-items-center user-select-none mx-2 my-4 p-1 hover-tachi bg-transition rounded ${
					open ? "bg-dark" : ""
				}`}
			>
				<div className="timeline-dot bg-warning align-self-center p-0" />

				<Col
					md={8}
					lg={10}
					onClick={handleClick}
					aria-controls="session-shower-container"
					aria-expanded={open}
					className="py-4 d-flex fw-light h-100 align-items-center cursor-pointer"
				>
					<ProfilePictureSmall
						className="me-2"
						user={user}
						toGPT={`${game}/${playtype}`}
					/>

					<Icon
						className="timeline-icon"
						type="chevron-right"
						show={open ? true : false}
					/>
					<span className="ms-2 fw-normal">
						<UGPTLink reqUser={user} game={game} playtype={playtype} /> highlighted{" "}
						{subMessage}!{" "}
						{mutedText && (
							<>
								<br />
								<Muted>{mutedText}</Muted>
							</>
						)}
					</span>
				</Col>

				<Col md={4} lg={2} className="py-4 text-end cursor-pointer" onClick={handleClick}>
					{MillisToSince(data.scores[0].timeAchieved ?? 0)}
					<div className="text-muted fst-italic">
						{FormatTime(data.scores[0].timeAchieved ?? 0)}
					</div>
				</Col>
				<Collapse className="px-2 py-3" in={open}>
					<div className="m-0 p-0" id="scores-container">
						<ScoreTable // TODO
							noTopDisplayStr
							dataset={dataset}
							game={game}
							playtype={playtype}
							timeline={true}
							active={active}
						/>
					</div>
				</Collapse>
			</Row>
		</>
	);
}

function GoalActivity({
	data,
	user,
	shouldShowGame,
}: {
	data: ClumpedActivityGoalAchievement;
	user: UserDocument;
	shouldShowGame: boolean;
}) {
	const { game, playtype } = data.goals[0];
	const prettyGame = shouldShowGame ? `${FormatGame(game, playtype)} ` : "";

	const [open, setOpen] = useState(false);

	const handleClick = () => {
		setOpen(!open);
	};

	let subMessage;
	let mutedText: string | null | undefined;

	if (data.goals.length === 1) {
		const goal0 = data.goals[0];

		subMessage = `${goal0.__related.goal.name}${
			shouldShowGame ? ` in ${FormatGame(game, playtype)}` : ""
		}!`;
	} else {
		subMessage = `${data.goals.length} ${prettyGame}goals`;

		mutedText = TruncateString(data.goals.map((e) => e.__related.goal.name).join(", "), 100);
	}

	return (
		<>
			<Row
				id="goal-activity"
				className={`align-items-center user-select-none mx-2 my-4 p-1 hover-tachi bg-transition rounded ${
					open ? "bg-dark" : ""
				}`}
			>
				<div className="timeline-dot bg-warning align-self-center p-0" />
				<Col
					md={8}
					lg={10}
					onClick={handleClick}
					aria-controls="session-shower-container"
					aria-expanded={open}
					className="py-4 d-flex fw-light h-100 align-items-center cursor-pointer"
				>
					<ProfilePictureSmall
						className="me-2"
						user={user}
						toGPT={`${game}/${playtype}`}
					/>
					<Icon className="timeline-icon" type="chevron-right" show={open} />
					<span className="ms-2">
						<UGPTLink reqUser={user} game={game} playtype={playtype} /> achieved{" "}
						{subMessage}!{" "}
						{mutedText && (
							<>
								<Muted>{mutedText}</Muted>
							</>
						)}
					</span>
				</Col>
				<Col md={4} lg={2} className="py-4 text-end cursor-pointer" onClick={handleClick}>
					{MillisToSince(data.goals[0]?.timeAchieved ?? 0)}
					<div className="text-muted fst-italic">
						{FormatTime(data.goals[0]?.timeAchieved ?? 0)}
					</div>
				</Col>
				<Collapse in={open}>
					<div className="m-0 p-0 overflow-y-hidden" id="session-shower-container">
						<Col className="clearfix" id="goals">
							{data.goals.map((e) => (
								<InnerQuestSectionGoal
									goal={e.__related.goal}
									goalSubOverride={e}
									key={e.goalID}
								/>
							))}
						</Col>
					</div>
				</Collapse>
			</Row>
		</>
	);
}

function QuestActivity({
	data,
	user,
	shouldShowGame,
}: {
	data: ClumpedActivityQuestAchievement;
	user: UserDocument;
	shouldShowGame: boolean;
}) {
	const { game, playtype } = data.quest;

	const prettyGame = shouldShowGame ? FormatGame(game, playtype) : "";

	return (
		<Row
			id="quest-activity"
			className="justify-content-between align-items-center user-select-none mx-2 my-2 py-3 hover-tachi rounded"
		>
			<div className="timeline-dot align-self-center p-0 bg-warning"></div>
			<Col md={8} lg={10} className=" d-flex fw-light h-100 align-items-center">
				<ProfilePictureSmall className="me-2" user={user} toGPT={`${game}/${playtype}`} />
				<span className="fw-normal">
					<UGPTLink reqUser={user} game={game} playtype={playtype} /> completed the{" "}
					<Link
						className="gentle-link"
						to={`/games/${game}/${playtype}/quests/${data.quest.questID}`}
					>
						{data.quest.name}
					</Link>{" "}
					quest{prettyGame && ` in ${prettyGame}`}!
				</span>
			</Col>
			<Col md={4} lg={2} className="text-end">
				{MillisToSince(data.sub.timeAchieved ?? 0)}
				<div className="text-muted fst-italic">
					{FormatTime(data.sub.timeAchieved ?? 0)}
				</div>
			</Col>
		</Row>
	);
}

function SessionActivity({
	data,
	user,
	shouldShowGame,
}: {
	data: ClumpedActivitySession;
	user: UserDocument;
	shouldShowGame: boolean;
}) {
	const { user: loggedInUser } = useContext(UserContext);
	const isProbablyActive = Date.now() - data.timeEnded < ONE_HOUR;
	const { game, playtype } = data;
	const prettyGame = shouldShowGame ? `${FormatGame(data.game, data.playtype)} ` : "";

	const [active, setActive] = useState(false);
	const [open, setOpen] = useState(false);

	const handleClick = () => {
		setOpen(!open);
		setActive(true);
	};

	return (
		<>
			<Row
				id="session-activity"
				className={`align-items-center user-select-none mx-2 my-4 p-1 hover-tachi bg-transition rounded ${
					open ? "bg-dark" : ""
				}`}
			>
				<div
					className={`timeline-dot align-self-center p-0 bg-${
						data.highlight ? "warning" : "secondary"
					} ${isProbablyActive ? "active" : ""}`}
				/>
				<Col
					md={8}
					lg={10}
					onClick={handleClick}
					aria-controls="session-shower-container"
					aria-expanded={open}
					className="py-4 d-flex fw-light h-100 align-items-center cursor-pointer"
				>
					<ProfilePictureSmall
						className="me-2"
						user={user}
						toGPT={`${game}/${playtype}`}
					/>
					<Icon className="timeline-icon" type="chevron-right" show={open} />
					<span className={`ms-2 ${isProbablyActive ? "fw-normal" : ""}`}>
						{/* worst string formatting ever */}
						<UGPTLink reqUser={user} game={data.game} playtype={data.playtype} />{" "}
						{isProbablyActive
							? user.id === loggedInUser?.id
								? "are having"
								: "is having"
							: "had"}{" "}
						a {prettyGame}
						session '{data.name}' with {data.scoreIDs.length}{" "}
						{data.scoreIDs.length === 1 ? "score" : "scores"}
						{data.highlight ? "!" : "."}
					</span>
					<br />
					{data.desc && data.desc !== "This session has no description." && (
						<span className="text-muted">{data.desc}</span>
					)}
				</Col>
				<Col md={4} lg={2} className="py-2 text-end cursor-pointer" onClick={handleClick}>
					{MillisToSince(data.timeStarted ?? 0)}
					<div className="text-muted fst-italic">{FormatTime(data.timeStarted ?? 0)}</div>
				</Col>
				<Collapse in={open}>
					<div className="m-0 p-0 overflow-y-hidden" id="session-shower-container">
						<SessionShower
							sessionID={data.sessionID}
							active={active}
							setOpen={setOpen}
						/>
					</div>
				</Collapse>
			</Row>
		</>
	);
}

function SessionShower({
	sessionID,
	active,
	setOpen,
}: {
	sessionID: string;
	active: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
	if (!active) {
		return null;
	}

	const { data, error } = useApiQuery<SessionReturns>(`/sessions/${sessionID}`);

	if (error) {
		return <ApiError error={error} />;
	}

	if (!data) {
		return (
			<Col
				className="mx-2 p-6 text-center"
				id="session-shower-loading"
				style={{ height: "186px" }}
			>
				<Loading />
			</Col>
		);
	}

	const handleClose = () => {
		setOpen(false);
	};

	const scoreMap = CreateScoreIDMap(data.scores);

	const gptConfig = GetGamePTConfig(data.session.game, data.session.playtype);

	const raises = data.scoreInfo.filter((e) => {
		const score = scoreMap.get(e.scoreID);

		// shouldnt happen, but whatever
		if (!score) {
			return false;
		}

		const enumMetrics = GetScoreEnumConfs(gptConfig);

		// for all enum metrics, check if this score beats the minimum relevant enum
		// and is a raise.
		for (const [metric, conf] of Object.entries(enumMetrics)) {
			if (!e.isNewScore && e.deltas[metric] <= 0) {
				continue;
			}

			if (
				// @ts-expect-error its gonna exist buddy
				score.scoreData.enumIndexes[metric] > conf.values.indexOf(conf.minimumRelevantValue)
			) {
				return true;
			}
		}

		return false;
	});

	if (raises.length === 0) {
		return (
			<Col className="py-6 text-center clearfix" id="session-shower">
				<div className="mb-8 mt-4">This session had no raises.</div>
				<LinkButton
					variant="outline-primary"
					className="mt-8 mb-4"
					to={`/u/${data.user.username}/games/${data.session.game}/${data.session.playtype}/sessions/${sessionID}`}
				>
					View Full Session
				</LinkButton>
			</Col>
		);
	}

	return (
		<Col className="mx-2 py-3 text-center clearfix" id="session-shower">
			<SessionRaiseBreakdown sessionData={data} setScores={NO_OP} /* TODO */ />

			<Divider />
			<CloseButton
				className="float-start mx-1 mt-1 d-block d-md-none"
				onClick={handleClose}
			/>
			<LinkButton
				variant="outline-primary"
				className="float-end float-md-none"
				to={`/u/${data.user.username}/games/${data.session.game}/${data.session.playtype}/sessions/${sessionID}`}
			>
				View Full Session
			</LinkButton>
		</Col>
	);
}

function ClassAchievementActivity({
	data,
	user,
	shouldShowGame,
}: {
	data: ClumpedActivityClassAchievement;
	user: UserDocument;
	shouldShowGame: boolean;
}) {
	return (
		<Row
			id="class-activity"
			className="justify-content-between align-items-center user-select-none mx-2 my-2 py-3 hover-tachi rounded"
		>
			<div className="timeline-dot bg-success align-self-center p-0" />
			<Col md={8} lg={10} className=" d-flex fw-light h-100 align-items-center">
				<ProfilePictureSmall
					className="me-6"
					user={user}
					toGPT={`${data.game}/${data.playtype}`}
				/>
				<span>
					<UGPTLink reqUser={user} game={data.game} playtype={data.playtype} /> achieved{" "}
					<ClassBadge
						className="mb-1 mb-md-0 mx-1"
						classSet={data.classSet}
						game={data.game}
						playtype={data.playtype}
						classValue={data.classValue}
					/>{" "}
					{shouldShowGame && ` in ${FormatGame(data.game, data.playtype)}`}!
					{data.classOldValue !== null && (
						<>
							{" "}
							(Raised from{" "}
							<span className="text-nowrap">
								<ClassBadge
									className="mb-1 mb-md-0 mx-1"
									classSet={data.classSet}
									game={data.game}
									playtype={data.playtype}
									classValue={data.classOldValue}
								/>
								)
							</span>
						</>
					)}
				</span>
			</Col>

			<Col md={4} lg={2} className="text-end">
				{MillisToSince(data.timeAchieved)}
				<div className="text-muted fst-italic">{FormatTime(data.timeAchieved)}</div>
			</Col>
		</Row>
	);
}

function UGPTLink({ reqUser, game, playtype }: UGPT) {
	// currently
	const { user } = useContext(UserContext);

	return (
		<Link
			to={`/u/${reqUser.username}/games/${game}/${playtype}`}
			className="gentle-link"
			style={{
				fontWeight: "bold",
			}}
		>
			{user?.id === reqUser.id ? "You" : reqUser.username}
			{reqUser?.isSupporter ? (
				<>
					{" "}
					<SupporterIcon />
				</>
			) : (
				<></>
			)}
		</Link>
	);
}
