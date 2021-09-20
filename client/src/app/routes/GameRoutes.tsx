import PlaytypeSelect from "app/pages/dashboard/games/_game/PlaytypeSelect";
import GPTSongsPage from "app/pages/dashboard/games/_game/_playtype/GPTSongsPage";
import GPTDevInfo from "app/pages/dashboard/games/_game/_playtype/GPTDevInfo";
import GPTLeaderboardsPage from "app/pages/dashboard/games/_game/_playtype/GPTLeaderboardsPage";
import GPTMainPage from "app/pages/dashboard/games/_game/_playtype/GPTMainPage";
import { ErrorPage } from "app/pages/ErrorPage";
import { GPTBottomNav, GPTHeaderBody } from "components/game/GPTHeader";
import LayoutHeaderContainer from "components/layout/LayoutHeaderContainer";
import React from "react";
import { Redirect, Route, Switch, useParams } from "react-router-dom";
import { FormatGame, Game, GetGameConfig } from "tachi-common";
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

			<Route path="/dashboard/games/:game/:playtype">
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
		<>
			<LayoutHeaderContainer
				footer={<GPTBottomNav baseUrl={`/dashboard/games/${game}/${playtype}`} />}
				header={FormatGame(game, playtype)}
			>
				<GPTHeaderBody game={game} playtype={playtype} />
			</LayoutHeaderContainer>
			<Switch>
				<Route exact path="/dashboard/games/:game/:playtype">
					<GPTMainPage game={game} playtype={playtype} />
				</Route>

				<Route exact path="/dashboard/games/:game/:playtype/songs">
					<GPTSongsPage game={game} playtype={playtype} />
				</Route>

				<Route exact path="/dashboard/games/:game/:playtype/leaderboards">
					<GPTLeaderboardsPage game={game} playtype={playtype} />
				</Route>

				<Route exact path="/dashboard/games/:game/:playtype/dev-info">
					<GPTDevInfo game={game} playtype={playtype} />
				</Route>

				<Route path="*">
					<ErrorPage statusCode={404} />
				</Route>
			</Switch>
		</>
	);
}
