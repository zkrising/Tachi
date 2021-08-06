import PlaytypeSelect from "app/pages/dashboard/games/_game/PlaytypeSelect";
import { ErrorPage } from "app/pages/ErrorPage";
import React from "react";
import { Redirect, Route, Switch, useParams } from "react-router-dom";
import { Game, GetGameConfig } from "tachi-common";
import { IsSupportedGame, IsSupportedPlaytype } from "util/asserts";

export default function GameRoutes() {
	const { game } = useParams<{ game: string }>();

	if (!IsSupportedGame(game)) {
		return <ErrorPage statusCode={404} customMessage={`The game ${game} is not supported.`} />;
	}

	const gameConfig = GetGameConfig(game);

	return (
		<Switch>
			<Route exact path="/dashboard/games/:game">
				{gameConfig.validPlaytypes.length === 1 ? (
					<Redirect to={`/dashboard/games/${game}/${gameConfig.validPlaytypes[0]}`} />
				) : (
					<PlaytypeSelect
						subheaderCrumbs={["Games", gameConfig.name]}
						subheaderTitle={`${gameConfig.name} Playtype Select`}
						base={`/dashboard/games/${game}`}
						game={game}
					/>
				)}
			</Route>

			<Route exact path="/dashboard/games/:game/:playtype">
				<GamePlaytypeRoutes game={game} />
			</Route>

			<Route path="*">
				<ErrorPage statusCode={404} />
			</Route>
		</Switch>
	);
}

function GamePlaytypeRoutes({ game }: { game: Game }) {
	const { playtype } = useParams<{ playtype: string }>();

	if (!IsSupportedPlaytype(game, playtype)) {
		return (
			<ErrorPage
				statusCode={400}
				customMessage={`The playtype ${playtype} is not supported.`}
			/>
		);
	}

	return (
		<Switch>
			<Route exact path="/dashboard/games/:game/:playtype">
				{game} {playtype}
			</Route>
		</Switch>
	);
}
