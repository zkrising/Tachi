import { ErrorPage } from "app/pages/ErrorPage";
import RequireAuthAsUserParam from "components/auth/RequireAuthAsUserParam";
import React, { useEffect, useState } from "react";
import { Route, Switch, useParams } from "react-router-dom";
import { Game, PublicUserDocument } from "tachi-common";
import { APIFetchV1 } from "util/api";
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

	return (
		<Switch>
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

	return (
		<Switch>
			<Route exact path="/dashboard/users/:userID/games/:game/:playtype">
				<PBsPage reqUser={reqUser} game={game} playtype={playtype} />
			</Route>
		</Switch>
	);
}
