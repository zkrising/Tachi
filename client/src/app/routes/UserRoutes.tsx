import PlaytypeSelect from "app/pages/dashboard/games/_game/PlaytypeSelect";
import AchievablesPage from "app/pages/dashboard/users/games/_game/_playtype/AchievablesPage";
import FoldersMainPage from "app/pages/dashboard/users/games/_game/_playtype/folders/FoldersMainPage";
import LeaderboardsPage from "app/pages/dashboard/users/games/_game/_playtype/LeaderboardsPage";
import OverviewPage from "app/pages/dashboard/users/games/_game/_playtype/OverviewPage";
import SessionsPage from "app/pages/dashboard/users/games/_game/_playtype/SessionsPage";
import UGPTSettingsPage from "app/pages/dashboard/users/games/_game/_playtype/UGPTSettingsPage";
import UserGamesPage from "app/pages/dashboard/users/UserGamesPage";
import UserIntegrationsPage from "app/pages/dashboard/users/UserIntegrationsPage";
import UserInvitesPage from "app/pages/dashboard/users/UserInvitesPage";
import UserSettingsPage from "app/pages/dashboard/users/UserSettingsPage";
import { ErrorPage } from "app/pages/ErrorPage";
import RequireAuthAsUserParam from "components/auth/RequireAuthAsUserParam";
import LayoutHeaderContainer from "components/layout/LayoutHeaderContainer";
import { UGPTBottomNav, UGPTHeaderBody } from "components/user/UGPTHeader";
import { UserBottomNav, UserHeaderBody } from "components/user/UserHeader";
import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import { BackgroundContext } from "context/BackgroundContext";
import { UGPTSettingsContext, UGPTSettingsContextProvider } from "context/UGPTSettingsContext";
import { UserContext } from "context/UserContext";
import React, { useContext, useEffect } from "react";
import { useQuery } from "react-query";
import { Redirect, Route, Switch, useParams } from "react-router-dom";
import {
	FormatGame,
	Game,
	GetGameConfig,
	PublicUserDocument,
	UGPTSettings,
	UserGameStats,
} from "tachi-common";
import { UGPTStatsReturn } from "types/api-returns";
import { APIFetchV1, APIFetchV1Return, ToAPIURL } from "util/api";
import { IsSupportedGame, IsSupportedPlaytype } from "util/asserts";
import ScoresPage from "../pages/dashboard/users/games/_game/_playtype/ScoresPage";
import UserPage from "../pages/dashboard/users/UserPage";

export default function UserRoutes() {
	const params = useParams<{ userID: string }>();

	const { data: reqUser, isLoading, error } = useApiQuery<PublicUserDocument>(
		`/users/${params.userID}`
	);

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

	if (isLoading || !reqUser) {
		return null;
	}

	return (
		<Switch>
			<Route path="/dashboard/users/:userID">
				<Switch>
					<Route path="/dashboard/users/:userID/games/:game">
						<UserGameRoutes reqUser={reqUser} />
					</Route>
					<UserProfileRoutes reqUser={reqUser} />
				</Switch>
			</Route>
		</Switch>
	);
}

function UserProfileRoutes({ reqUser }: { reqUser: PublicUserDocument }) {
	return (
		<>
			<LayoutHeaderContainer
				header={`${reqUser.username}'s Profile`}
				footer={
					<UserBottomNav
						reqUser={reqUser}
						baseUrl={`/dashboard/users/${reqUser.username}`}
					/>
				}
			>
				<UserHeaderBody reqUser={reqUser} />
			</LayoutHeaderContainer>
			<Route exact path="/dashboard/users/:userID">
				<UserPage reqUser={reqUser} />
			</Route>
			<Route exact path="/dashboard/users/:userID/games">
				<UserGamesPage reqUser={reqUser} />
			</Route>
			<Route exact path="/dashboard/users/:userID/settings">
				<RequireAuthAsUserParam>
					<UserSettingsPage reqUser={reqUser} />
				</RequireAuthAsUserParam>
			</Route>
			<Route exact path="/dashboard/users/:userID/integrations">
				<RequireAuthAsUserParam>
					<UserIntegrationsPage reqUser={reqUser} />
				</RequireAuthAsUserParam>
			</Route>
			<Route exact path="/dashboard/users/:userID/invites">
				<RequireAuthAsUserParam>
					<UserInvitesPage reqUser={reqUser} />
				</RequireAuthAsUserParam>
			</Route>
		</>
	);
}

function UserGameRoutes({ reqUser }: { reqUser: PublicUserDocument }) {
	const { game } = useParams<{ game: string }>();

	if (!IsSupportedGame(game)) {
		return <ErrorPage statusCode={400} customMessage={`The game ${game} is not supported.`} />;
	}

	const gameConfig = GetGameConfig(game);

	return (
		<Switch>
			<Route exact path="/dashboard/users/:userID/games/:game">
				{gameConfig.validPlaytypes.length === 1 ? (
					<Redirect
						to={`/dashboard/users/${reqUser.username}/games/${game}/${gameConfig.validPlaytypes[0]}`}
					/>
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
				<UGPTSettingsContextProvider>
					<UserGamePlaytypeRoutes reqUser={reqUser} game={game} />
				</UGPTSettingsContextProvider>
			</Route>
		</Switch>
	);
}

function UserGamePlaytypeRoutes({ reqUser, game }: { reqUser: PublicUserDocument; game: Game }) {
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
	const { setSettings } = useContext(UGPTSettingsContext);

	useEffect(() => {
		(async () => {
			if (user) {
				const settingsRes = await APIFetchV1<UGPTSettings>(
					`/users/${user.id}/games/${game}/${playtype}/settings`
				);

				if (!settingsRes.success) {
					setSettings(null);
					return;
				}

				setSettings(settingsRes.body);
			}
		})();

		return () => {
			setSettings(null);
		};
	}, [user, game, playtype]);

	const { isLoading, error, data } = useQuery<UGPTStatsReturn, APIFetchV1Return<UserGameStats>>(
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

	if (isLoading || !data) {
		return <Loading />;
	}

	const stats = data;

	return (
		<>
			<LayoutHeaderContainer
				header={`${reqUser.username}'s ${FormatGame(game, playtype)} Profile`}
				footer={
					<UGPTBottomNav
						isRequestedUser={reqUser.id === user?.id}
						baseUrl={`/dashboard/users/${reqUser.username}/games/${game}/${playtype}`}
					/>
				}
			>
				<UGPTHeaderBody reqUser={reqUser} game={game} playtype={playtype} stats={stats} />
			</LayoutHeaderContainer>
			<Switch>
				<Route exact path="/dashboard/users/:userID/games/:game/:playtype">
					<OverviewPage reqUser={reqUser} game={game} playtype={playtype} />
				</Route>
				<Route path="/dashboard/users/:userID/games/:game/:playtype/scores">
					<ScoresPage reqUser={reqUser} game={game} playtype={playtype} />
				</Route>
				<Route path="/dashboard/users/:userID/games/:game/:playtype/folders">
					<FoldersMainPage reqUser={reqUser} game={game} playtype={playtype} />
				</Route>
				<Route exact path="/dashboard/users/:userID/games/:game/:playtype/sessions">
					<SessionsPage reqUser={reqUser} game={game} playtype={playtype} />
				</Route>
				<Route exact path="/dashboard/users/:userID/games/:game/:playtype/achievables">
					<AchievablesPage reqUser={reqUser} game={game} playtype={playtype} />
				</Route>
				<Route exact path="/dashboard/users/:userID/games/:game/:playtype/leaderboard">
					<LeaderboardsPage reqUser={reqUser} game={game} playtype={playtype} />
				</Route>
				<Route exact path="/dashboard/users/:userID/games/:game/:playtype/settings">
					<UGPTSettingsPage reqUser={reqUser} game={game} playtype={playtype} />
				</Route>
				<Route path="*">
					<ErrorPage statusCode={404} />
				</Route>
			</Switch>
		</>
	);
}
