import PlaytypeSelect from "app/pages/dashboard/games/_game/PlaytypeSelect";
import LeaderboardsPage from "app/pages/dashboard/users/games/_game/_playtype/LeaderboardsPage";
import OverviewPage from "app/pages/dashboard/users/games/_game/_playtype/OverviewPage";
import SessionsPage from "app/pages/dashboard/users/games/_game/_playtype/SessionsPage";
import { ErrorPage } from "app/pages/ErrorPage";
import RequireAuthAsUserParam from "components/auth/RequireAuthAsUserParam";
import UGPTHeader from "components/user/UGPTHeader";
import Loading from "components/util/Loading";
import { BackgroundContext } from "context/BackgroundContext";
import React, { useContext, useEffect, useState } from "react";
import { useQuery } from "react-query";
import { Redirect, Route, Switch, useParams } from "react-router-dom";
import { Game, GetGameConfig, PublicUserDocument, UserGameStats, UGPTSettings } from "tachi-common";
import { UGPTStatsReturn } from "types/api-returns";
import { APIFetchV1, APIFetchV1Return, ToAPIURL } from "util/api";
import { IsSupportedGame, IsSupportedPlaytype } from "util/asserts";
import ScoresPage from "../pages/dashboard/users/games/_game/_playtype/ScoresPage";
import UserPage from "../pages/dashboard/users/UserPage";

export default function UserRoutes() {
	const [reqUser, setReqUser] = useState<PublicUserDocument | null>(null);
	const params = useParams<{ userID: string }>();

	useEffect(() => {
		(async () => {
			const res = await APIFetchV1<PublicUserDocument>(`/users/${params.userID}`);

			if (!res.success) {
				console.error(res);
			} else {
				setReqUser(res.body);
			}
		})();
	}, [params.userID]);

	const { setBackground } = useContext(BackgroundContext);
	useEffect(() => {
		if (reqUser) {
			setBackground(ToAPIURL(`/users/${reqUser.id}/banner`));
		}

		return () => {
			setBackground(null);
		};
	}, [reqUser]);

	if (!reqUser) {
		return null;
	}

	return (
		<Switch>
			<Route exact path="/dashboard/users/:userID">
				<UserPage reqUser={reqUser} />
			</Route>

			<Route exact path="/dashboard/users/:userID/settings">
				<RequireAuthAsUserParam>Settings Page</RequireAuthAsUserParam>
			</Route>

			<Route path="/dashboard/users/:userID/games/:game">
				<UserGameRoutes reqUser={reqUser} />
			</Route>
		</Switch>
	);
}

function UserGameRoutes({ reqUser }: { reqUser: PublicUserDocument }) {
	const { game } = useParams<{ game: string }>();

	if (!IsSupportedGame(game)) {
		return <ErrorPage statusCode={400} customMessage="This game is not supported." />;
	}

	const gameConfig = GetGameConfig(game);

	return (
		<Switch>
			<Route exact path="/dashboard/users/:userID/games/:game">
				{gameConfig.validPlaytypes.length === 1 ? (
					<Redirect to={`/dashboard/games/${game}/${gameConfig.validPlaytypes[0]}`} />
				) : (
					<PlaytypeSelect
						subheaderCrumbs={["Users", reqUser.username, "Games", gameConfig.name]}
						subheaderTitle={`${reqUser.username} ${gameConfig.name} Playtype Select`}
						base={`/dashboard/users/${reqUser.username}/games/${game}`}
						game={game}
					/>
				)}
			</Route>

			<Route path="/dashboard/users/:userID/games/:game/:playtype">
				<UserGamePlaytypeRoutes reqUser={reqUser} game={game} />
			</Route>
		</Switch>
	);
}

function UserGamePlaytypeRoutes({ reqUser, game }: { reqUser: PublicUserDocument; game: Game }) {
	const { playtype } = useParams<{ playtype: string }>();

	if (!IsSupportedPlaytype(game, playtype)) {
		return <ErrorPage statusCode={400} customMessage="This playtype is not supported." />;
	}

	const { isLoading, error, data } = useQuery<
		[UGPTStatsReturn, UGPTSettings],
		APIFetchV1Return<UserGameStats>
	>(
		[reqUser.id, game, playtype],
		async () => {
			const res = await APIFetchV1<UGPTStatsReturn>(
				`/users/${reqUser.id}/games/${game}/${playtype}`
			);

			if (!res.success) {
				console.error(res);
				throw res;
			}

			const settingsRes = await APIFetchV1<UGPTSettings>(
				`/users/${reqUser.id}/games/${game}/${playtype}/settings`
			);

			if (!settingsRes.success) {
				console.error(settingsRes);
				throw settingsRes;
			}

			return [res.body, settingsRes.body];
		},
		{ retry: 0 }
	);

	if (error?.statusCode === 404) {
		return <ErrorPage statusCode={404} customMessage="This user has not played this game!" />;
	}

	if (error) {
		return <ErrorPage statusCode={error.statusCode} />;
	}

	if (isLoading || !data) {
		return <Loading />;
	}

	const [stats, settings] = data;

	return (
		<>
			<UGPTHeader reqUser={reqUser} game={game} playtype={playtype} stats={stats} />
			<Switch>
				<Route exact path="/dashboard/users/:userID/games/:game/:playtype">
					<OverviewPage
						reqUser={reqUser}
						game={game}
						playtype={playtype}
						settings={settings}
					/>
				</Route>
				<Route exact path="/dashboard/users/:userID/games/:game/:playtype/scores">
					<ScoresPage reqUser={reqUser} game={game} playtype={playtype} />
				</Route>
				<Route exact path="/dashboard/users/:userID/games/:game/:playtype/folders">
					<div>foo</div>
				</Route>
				<Route exact path="/dashboard/users/:userID/games/:game/:playtype/sessions">
					<SessionsPage reqUser={reqUser} game={game} playtype={playtype} />
				</Route>
				<Route exact path="/dashboard/users/:userID/games/:game/:playtype/achievables">
					<div>goalsandmilestones</div>
				</Route>
				<Route exact path="/dashboard/users/:userID/games/:game/:playtype/leaderboard">
					<LeaderboardsPage reqUser={reqUser} game={game} playtype={playtype} />
				</Route>
				<Route path="*">
					<ErrorPage statusCode={404} />
				</Route>
			</Switch>
		</>
	);
}
