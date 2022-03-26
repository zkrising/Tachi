import { APIFetchV1 } from "util/api";
import { RFA } from "util/misc";
import { NumericSOV } from "util/sorts";
import { heySplashes } from "util/splashes";
import { ChangeOpacity } from "util/color-opacity";
import { CreateGoalMap } from "util/data";
import useSetSubheader from "components/layout/header/useSetSubheader";
import SessionCard from "components/sessions/SessionCard";
import ApiError from "components/util/ApiError";
import AsyncLoader from "components/util/AsyncLoader";
import Divider from "components/util/Divider";
import GentleLink from "components/util/GentleLink";
import LinkButton from "components/util/LinkButton";
import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import { UserContext } from "context/UserContext";
import { UserGameStatsContext } from "context/UserGameStatsContext";
import { UserSettingsContext } from "context/UserSettingsContext";
import { TachiConfig } from "lib/config";
import React, { useContext } from "react";
import { Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { COLOUR_SET, GetGameConfig, PublicUserDocument } from "tachi-common";
import { UGSWithRankingData, UserRecentSummary } from "types/api-returns";
import { FolderInfoComponent } from "./users/games/_game/_playtype/folders/FolderSelectPage";
import { GameStatContainer } from "./users/UserGamesPage";

export function DashboardPage() {
	const { settings } = useContext(UserSettingsContext);

	useSetSubheader("Dashboard", [settings]);

	const { user } = useContext(UserContext);
	const { ugs } = useContext(UserGameStatsContext);

	if (!user) {
		return <DashboardNotLoggedIn />;
	}

	return (
		<>
			{ugs?.length ? (
				<DashboardLoggedIn user={user} />
			) : (
				<DashboardLoggedInNoScores user={user} />
			)}
		</>
	);
}

function DashboardLoggedIn({ user }: { user: PublicUserDocument }) {
	return (
		<div>
			<span className="display-4">
				{RFA(heySplashes)}, {user.username}.
			</span>
			<Divider />
			<RecentInfo user={user} />
			<h1>Here's all your profiles.</h1>
			<Divider />

			<UserGameStatsInfo user={user} />
		</div>
	);
}

function RecentInfo({ user }: { user: PublicUserDocument }) {
	const { data, isLoading, error } = useApiQuery<UserRecentSummary>(
		`/users/${user.id}/recent-summary`
	);

	if (error) {
		return <ApiError error={error} />;
	}

	if (isLoading || !data) {
		return <Loading />;
	}

	const folderInfoMap = new Map();
	for (const folderInfo of data.recentFolderStats) {
		folderInfoMap.set(folderInfo.folderID, folderInfo);
	}

	const goalMap = CreateGoalMap(data.recentGoals);

	return (
		<>
			{data.recentSessions.length !== 0 && (
				<>
					<Alert
						style={{
							backgroundColor:
								TachiConfig.type === "ktchi" ? "#e61c6e44" : "#527acc44",
							color: "white",
						}}
					>
						<div className="text-center">
							<h1>Today's Summary</h1>
							You've gotten <b>{data.recentPlaycount}</b> new score
							{data.recentPlaycount !== 1 ? "s" : ""} today!
						</div>
					</Alert>
					<Divider />
					<h1>New Sessions</h1>
					You've had <b>{data.recentSessions.length}</b> session
					{data.recentSessions.length !== 1 ? "s" : ""} today!
					<Divider />
					{data.recentSessions.sort(NumericSOV(x => x.timeEnded, true)).map(e => (
						<SessionCard sessionID={e.sessionID} key={e.sessionID} />
					))}
					<Divider />
				</>
			)}
			{data.recentAchievedGoals.length !== 0 && (
				<>
					<Alert
						style={{
							backgroundColor: ChangeOpacity(COLOUR_SET.gold, 0.2),
						}}
					>
						<div className="text-center text-white">
							<h1>
								{RFA([
									"Sweet!",
									"Nice!",
									"Lookin' good!",
									"Good Stuff!",
									"owo",
									"Cool!",
									"Awesome!",
									"Epic!",
								])}
							</h1>
							You've achieved <b>{data.recentAchievedGoals.length}</b> new goal
							{data.recentAchievedGoals.length !== 1 ? "s" : ""} today!
						</div>
						<Divider />
						<div className="text-white">
							<ul>
								{data.recentAchievedGoals.map(e => (
									<GentleLink
										to={`/dashboard/games/${e.game}/${e.playtype}/targets/goals/${e.goalID}`}
										key={e.goalID}
									>
										<li>{goalMap.get(e.goalID)?.title}</li>
									</GentleLink>
								))}
							</ul>
						</div>
					</Alert>
					<Divider />
				</>
			)}
			{data.recentFolders.length !== 0 && (
				<>
					<h1>Here's some folders you checked out recently.</h1>
					<Divider />
					<div className="row">
						{data.recentFolders.map(e => (
							<FolderInfoComponent
								key={e.folderID}
								folder={e}
								game={e.game}
								playtype={e.playtype}
								reqUser={user}
								folderStats={folderInfoMap.get(e.folderID)!}
							/>
						))}
					</div>
					<Divider />
				</>
			)}
		</>
	);
}

function UserGameStatsInfo({ user }: { user: PublicUserDocument }) {
	return (
		<div className="row">
			<AsyncLoader
				promiseFn={async () => {
					const res = await APIFetchV1<UGSWithRankingData[]>(
						`/users/${user.id}/game-stats`
					);

					if (!res.success) {
						throw new Error(res.description);
					}

					return res.body.sort((a, b) => {
						if (a.game === b.game) {
							const gameConfig = GetGameConfig(a.game);

							return (
								gameConfig.validPlaytypes.indexOf(a.playtype) -
								gameConfig.validPlaytypes.indexOf(b.playtype)
							);
						}

						const i1 = TachiConfig.games.indexOf(a.game);
						const i2 = TachiConfig.games.indexOf(b.game);

						return i1 - i2;
					});
				}}
			>
				{ugs =>
					ugs.map(e => (
						<GameStatContainer ugs={e} reqUser={user} key={`${e.game}:${e.playtype}`} />
					))
				}
			</AsyncLoader>
		</div>
	);
}

function DashboardNotLoggedIn() {
	return (
		<div style={{ fontSize: "1.3rem" }}>
			<h1 className="mb-4">Welcome to {TachiConfig.name}!</h1>
			<h4>
				Looks like you're not logged in. If you've got an account,{" "}
				<Link to="/login">Login!</Link>
			</h4>
			<Divider />
			<h1 className="my-4">I'm New Around Here, What is this?</h1>
			<span>
				<b>{TachiConfig.name}</b> is a Rhythm Game Score Tracker. That means we...
			</span>
			<Divider />
			<FeatureContainer
				tagline="Track Your Scores."
				description={`${TachiConfig.name} supports a bunch of your favourite games, and integrates with many existing services to make sure no score is lost to the void. Furthermore, it's backed by an Open-Source API, so your scores are always available!`}
			/>
			<FeatureContainer
				tagline="Analyse Your Scores."
				description={`${TachiConfig.name} analyses your scores for you, breaking them down into all the statistics you'll ever need. No more spreadsheets!`}
			/>
			<FeatureContainer
				tagline="Provide Cool Features."
				description={`${TachiConfig.name} implements the features rhythm gamers already talk about. Break your scores down into sessions, Showcase your best metrics on your profile, study your progress on folders - it's all there, and done for you!`}
			/>
			<Divider />
			<div className="col-12 text-center" style={{ paddingTop: 50, height: 250 }}>
				Interested? You can register right now for <b>free</b>!
				<br />
				<LinkButton to="/register" className="mt-4 btn-outline-primary">
					Register!
				</LinkButton>
			</div>
		</div>
	);
}

function FeatureContainer({ tagline, description }: { tagline: string; description: string }) {
	return (
		<div className="row my-4 mb-16" style={{ lineHeight: "1.3", fontSize: "1.15rem" }}>
			<div className="col-12 col-lg-6">
				<h1 className="display-4">{tagline}</h1>
				<span>{description}</span>
			</div>
		</div>
	);
}

function DashboardLoggedInNoScores({ user }: { user: PublicUserDocument }) {
	return (
		<div>
			<span className="display-4">
				Welcome to {TachiConfig.name}, {user.username}!
			</span>
			<h4 className="mt-4">It looks like you have no scores. Let's get you set up!</h4>
			<Divider />
			<h4 style={{ lineHeight: 2 }}>
				Once you've got some scores imported, we'll analyse your scores.
				<br />
				You'll get a profile for that game, and a position on the leaderboards!
			</h4>
			<LinkButton className="btn-outline-primary" to="/dashboard/import">
				Import some scores!
			</LinkButton>
		</div>
	);
}
