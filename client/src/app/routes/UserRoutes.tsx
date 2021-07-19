import PlaytypeSelect from "app/pages/dashboard/games/_game/PlaytypeSelect";
import { ErrorPage } from "app/pages/ErrorPage";
import RequireAuthAsUserParam from "components/auth/RequireAuthAsUserParam";
import Loading from "components/util/Loading";
import { BackgroundContext } from "context/BackgroundContext";
import React, { useContext, useEffect, useState } from "react";
import { useQuery } from "react-query";
import { Redirect, Route, Switch, useParams } from "react-router-dom";
import { Game, GetGameConfig, PublicUserDocument, UserGameStats } from "tachi-common";
import { APIFetchV1, APIFetchV1Return, ToAPIURL } from "util/api";
import { IsSupportedGame, IsSupportedPlaytype } from "util/asserts";
import PBsPage from "../pages/dashboard/users/games/_game/_playtype/PBsPage";
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

	const { isLoading, error, data } = useQuery<unknown, APIFetchV1Return<UserGameStats>>(
		`${reqUser.id}_${game}_${playtype}`,
		async () => {
			const res = await APIFetchV1<UserGameStats>(
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

	const ugs = data;

	return (
		<Switch>
			<Route exact path="/dashboard/users/:userID/games/:game/:playtype">
				<PBsPage reqUser={reqUser} game={game} playtype={playtype} />
			</Route>
		</Switch>
	);
}
