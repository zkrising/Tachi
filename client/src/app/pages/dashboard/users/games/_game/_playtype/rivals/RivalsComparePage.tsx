import ScoreLeaderboard from "components/game/ScoreLeaderboard";
import useSetSubheader from "components/layout/header/useSetSubheader";
import Divider from "components/util/Divider";
import Icon from "components/util/Icon";
import SelectLinkButton from "components/util/SelectLinkButton";
import useUGPTBase from "components/util/useUGPTBase";
import React from "react";
import { Col, Row } from "react-bootstrap";
import { Route, Switch } from "react-router-dom";
import { FormatGame, Game, GetGameConfig, Playtype, PublicUserDocument } from "tachi-common";

export default function RivalsComparePage({
	reqUser,
	game,
	playtype,
}: {
	reqUser: PublicUserDocument;
	game: Game;
	playtype: Playtype;
}) {
	const gameConfig = GetGameConfig(game);

	useSetSubheader(
		["Users", reqUser.username, "Games", gameConfig.name, playtype, "Rivals", "Compare"],
		[reqUser, game, playtype],
		`Comparing ${reqUser.username}'s ${FormatGame(game, playtype)} Rivals`
	);

	const base = `${useUGPTBase({ reqUser, game, playtype })}/rivals/compare`;

	return (
		<Row>
			<Col xs={12} className="text-center">
				<div className="btn-group">
					<SelectLinkButton to={`${base}/top-100`}>
						<Icon type="list" />
						Compare Top 100s
					</SelectLinkButton>
					<SelectLinkButton to={base}>
						<Icon type="sort-amount-up" />
						Best PBs
					</SelectLinkButton>
					<SelectLinkButton to={`${base}/folders`}>
						<Icon type="folder-open" />
						Folder Comparisons
					</SelectLinkButton>
				</div>
				<Divider />
			</Col>
			<Col xs={12}>
				<Switch>
					<Route
						exact
						path="/dashboard/users/:userID/games/:game/:playtype/rivals/compare/top-100"
					>
						top100
					</Route>

					<Route
						exact
						path="/dashboard/users/:userID/games/:game/:playtype/rivals/compare"
					>
						<ScoreLeaderboard
							game={game}
							playtype={playtype}
							url={`/users/${reqUser.id}/games/${game}/${playtype}/rivals/score-leaderboard`}
						/>
					</Route>

					<Route
						exact
						path="/dashboard/users/:userID/games/:game/:playtype/rivals/compare/folders"
					>
						folders
					</Route>
				</Switch>
			</Col>
		</Row>
	);
}
