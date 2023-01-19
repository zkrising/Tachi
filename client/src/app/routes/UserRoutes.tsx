import { APIFetchV1, APIFetchV1Return, ToAPIURL } from "util/api";
import { IsSupportedGame, IsSupportedPlaytype } from "util/asserts";
import { ErrorPage } from "app/pages/ErrorPage";
import PlaytypeSelect from "app/pages/dashboard/games/_game/PlaytypeSelect";
import UserGamesPage from "app/pages/dashboard/users/UserGamesPage";
import UserImportsPage from "app/pages/dashboard/users/UserImportsPage";
import UserIntegrationsPage from "app/pages/dashboard/users/UserIntegrationsPage";
import UserInvitesPage from "app/pages/dashboard/users/UserInvitesPage";
import UserSettingsPage from "app/pages/dashboard/users/UserSettingsPage";
import LeaderboardsPage from "app/pages/dashboard/users/games/_game/_playtype/LeaderboardsPage";
import OverviewPage from "app/pages/dashboard/users/games/_game/_playtype/OverviewPage";
import SessionsPage from "app/pages/dashboard/users/games/_game/_playtype/SessionsPage";
import SpecificSessionPage from "app/pages/dashboard/users/games/_game/_playtype/SpecificSessionPage";
import UGPTSettingsPage from "app/pages/dashboard/users/games/_game/_playtype/UGPTSettingsPage";
import FoldersMainPage from "app/pages/dashboard/users/games/_game/_playtype/folders/FoldersMainPage";
import RivalsMainPage from "app/pages/dashboard/users/games/_game/_playtype/rivals/RivalsMainPage";
import TargetsPage from "app/pages/dashboard/users/games/_game/_playtype/targets/TargetsPage";
import RequireAuthAsUserParam from "components/auth/RequireAuthAsUserParam";
import LayoutHeaderContainer from "components/layout/LayoutHeaderContainer";
import { UGPTBottomNav, UGPTHeaderBody } from "components/user/UGPTHeader";
import { UserBottomNav, UserHeaderBody } from "components/user/UserHeader";
import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import { BackgroundContext } from "context/BackgroundContext";
import { TargetsContextProvider } from "context/TargetsContext";
import { UGPTContextProvider } from "context/UGPTContext";
import { UserContext } from "context/UserContext";
import { UserSettingsContext } from "context/UserSettingsContext";
import React, { useContext, useEffect } from "react";
import { useQuery } from "react-query";
import { Redirect, Route, Switch, useHistory, useParams } from "react-router-dom";
import { FormatGame, Game, GetGameConfig, UserDocument, UserGameStats } from "tachi-common";
import { UGPTStatsReturn } from "types/api-returns";
import UGPTUtilsPage from "app/pages/dashboard/users/games/_game/_playtype/utils/UGPTUtilsPage";
import UserPage from "../pages/dashboard/users/UserPage";
import ScoresPage from "../pages/dashboard/users/games/_game/_playtype/ScoresPage";

export default function UserRoutes() {
	const params = useParams<{ userID: string }>();
	const { userID } = useParams<{ userID: string }>();
	const history = useHistory();

	const { data: reqUser, error } = useApiQuery<UserDocument>(`/users/${params.userID}`);

	const { setBackground } = useContext(BackgroundContext);
	useEffect(() => {
		if (reqUser) {
			setBackground(ToAPIURL(`/users/${reqUser.id}/banner`));
		}

		return () => {
			setBackground(null);
		};
	}, [reqUser]);

	if (error && error.statusCode === 404) {
		return <ErrorPage statusCode={404} customMessage="This user does not exist!" />;
	}

	if (error) {
		return <ErrorPage statusCode={error.statusCode} customMessage={error.description} />;
	}

	if (!reqUser) {
		return null;
	}

	// redirect to the users actual name if using a user ID or "me"
	if (userID.match(/^([0-9]+|me)$/u)) {
		const split = history.location.pathname.match(/^(\/u)\/([0-9]+|me)(.*)$/u);

		if (!split) {
			return (
				<ErrorPage
					statusCode={404}
					customMessage="I mean, this might be my fault. It might be yours. How the hell did you get here? (REPORT THIS!)"
				/>
			);
		}

		const newPath = `${split[1]}/${reqUser.username}${split[3]}`;

		return <Redirect to={newPath} />;
	}

	return (
		<Switch>
			<Route path="/u/:userID">
				<Switch>
					<Route path="/u/:userID/games/:game">
						<UserGameRoutes reqUser={reqUser} />
					</Route>
					<UserProfileRoutes reqUser={reqUser} />
				</Switch>
			</Route>
		</Switch>
	);
}

function UserProfileRoutes({ reqUser }: { reqUser: UserDocument }) {
	const { settings } = useContext(UserSettingsContext);

	return (
		<>
			<LayoutHeaderContainer
				header={
					settings?.preferences.developerMode
						? `${reqUser.username} (UID: ${reqUser.id})`
						: `${reqUser.username}'s Profile`
				}
				footer={<UserBottomNav reqUser={reqUser} baseUrl={`/u/${reqUser.username}`} />}
			>
				<UserHeaderBody reqUser={reqUser} />
			</LayoutHeaderContainer>
			<Route exact path="/u/:userID">
				<UserPage reqUser={reqUser} />
			</Route>
			<Route exact path="/u/:userID/games">
				<UserGamesPage reqUser={reqUser} />
			</Route>
			<Route exact path="/u/:userID/settings">
				<RequireAuthAsUserParam>
					<UserSettingsPage reqUser={reqUser} />
				</RequireAuthAsUserParam>
			</Route>
			<Route path="/u/:userID/integrations">
				<RequireAuthAsUserParam>
					<UserIntegrationsPage reqUser={reqUser} />
				</RequireAuthAsUserParam>
			</Route>
			<Route path="/u/:userID/imports">
				<RequireAuthAsUserParam>
					<UserImportsPage reqUser={reqUser} />
				</RequireAuthAsUserParam>
			</Route>
			<Route exact path="/u/:userID/invites">
				<RequireAuthAsUserParam>
					<UserInvitesPage reqUser={reqUser} />
				</RequireAuthAsUserParam>
			</Route>
		</>
	);
}

function UserGameRoutes({ reqUser }: { reqUser: UserDocument }) {
	const { game } = useParams<{ game: string }>();

	if (!IsSupportedGame(game)) {
		return <ErrorPage statusCode={400} customMessage={`The game ${game} is not supported.`} />;
	}

	const gameConfig = GetGameConfig(game);

	return (
		<Switch>
			<Route exact path="/u/:userID/games/:game">
				{gameConfig.playtypes.length === 1 ? (
					<Redirect
						to={`/u/${reqUser.username}/games/${game}/${gameConfig.playtypes[0]}`}
					/>
				) : (
					<PlaytypeSelect
						subheaderCrumbs={["Users", reqUser.username, "Games", gameConfig.name]}
						subheaderTitle={`${reqUser.username} ${gameConfig.name} Playtype Select`}
						base={`/u/${reqUser.username}/games/${game}`}
						game={game}
					/>
				)}
			</Route>

			<Route path="/u/:userID/games/:game/:playtype">
				<UGPTContextProvider>
					<TargetsContextProvider>
						<UserGamePlaytypeRoutes reqUser={reqUser} game={game} />
					</TargetsContextProvider>
				</UGPTContextProvider>
			</Route>
		</Switch>
	);
}

function UserGamePlaytypeRoutes({ reqUser, game }: { reqUser: UserDocument; game: Game }) {
	const { playtype } = useParams<{ playtype: string }>();

	if (!IsSupportedPlaytype(game, playtype)) {
		return (
			<ErrorPage
				statusCode={400}
				customMessage={`The playtype ${playtype} is not supported.`}
			/>
		);
	}

	const { user } = useContext(UserContext);

	const { data, error } = useQuery<UGPTStatsReturn, APIFetchV1Return<UserGameStats>>(
		[reqUser.id, game, playtype],
		async () => {
			const res = await APIFetchV1<UGPTStatsReturn>(
				`/users/${reqUser.id}/games/${game}/${playtype}`
			);

			if (!res.success) {
				console.error(res);
				throw res;
			}

			return res.body;
		},
		{ retry: 0 }
	);

	if (error?.statusCode === 404) {
		return <ErrorPage statusCode={404} customMessage="This user has not played this game!" />;
	}

	if (error) {
		return <ErrorPage statusCode={error.statusCode} />;
	}

	if (!data) {
		return <Loading />;
	}

	const stats = data;

	return (
		<>
			<LayoutHeaderContainer
				header={`${reqUser.username}'s ${FormatGame(game, playtype)} Profile`}
				footer={
					<UGPTBottomNav
						game={game}
						playtype={playtype}
						isRequestedUser={reqUser.id === user?.id}
						baseUrl={`/u/${reqUser.username}/games/${game}/${playtype}`}
					/>
				}
			>
				<UGPTHeaderBody reqUser={reqUser} game={game} playtype={playtype} stats={stats} />
			</LayoutHeaderContainer>
			<Switch>
				<Route exact path="/u/:userID/games/:game/:playtype">
					<OverviewPage reqUser={reqUser} game={game} playtype={playtype} />
				</Route>
				<Route path="/u/:userID/games/:game/:playtype/scores">
					<ScoresPage reqUser={reqUser} game={game} playtype={playtype} />
				</Route>
				<Route path="/u/:userID/games/:game/:playtype/folders">
					<FoldersMainPage reqUser={reqUser} game={game} playtype={playtype} />
				</Route>
				<Route exact path="/u/:userID/games/:game/:playtype/sessions">
					<SessionsPage reqUser={reqUser} game={game} playtype={playtype} />
				</Route>
				<Route path="/u/:userID/games/:game/:playtype/sessions/:sessionID">
					<SpecificSessionPage reqUser={reqUser} game={game} playtype={playtype} />
				</Route>
				<Route path="/u/:userID/games/:game/:playtype/rivals">
					<RivalsMainPage reqUser={reqUser} game={game} playtype={playtype} />
				</Route>
				<Route path="/u/:userID/games/:game/:playtype/targets">
					<TargetsPage reqUser={reqUser} game={game} playtype={playtype} />
				</Route>
				<Route exact path="/u/:userID/games/:game/:playtype/leaderboard">
					<LeaderboardsPage reqUser={reqUser} game={game} playtype={playtype} />
				</Route>
				<Route path="/u/:userID/games/:game/:playtype/utils">
					<UGPTUtilsPage reqUser={reqUser} game={game} playtype={playtype} />
				</Route>
				<RequireAuthAsUserParam>
					<Route exact path="/u/:userID/games/:game/:playtype/settings">
						<UGPTSettingsPage reqUser={reqUser} game={game} playtype={playtype} />
					</Route>
				</RequireAuthAsUserParam>
				<Route path="*">
					<ErrorPage statusCode={404} />
				</Route>
			</Switch>
		</>
	);
}
