import useSetSubheader from "components/layout/header/useSetSubheader";
import Divider from "components/util/Divider";
import Icon from "components/util/Icon";
import SelectLinkButton from "components/util/SelectLinkButton";
import useUGPTBase from "components/util/useUGPTBase";
import React from "react";
import { Row, Col } from "react-bootstrap";
import { Switch, Route } from "react-router-dom";
import { FormatGame, Game, GetGameConfig, Playtype, PublicUserDocument } from "tachi-common";
import ReceivedChallengesPage from "./ReceivedChallengesPage";
import RivalsOverviewPage from "./RivalsOverviewPage";

export default function RivalsMainPage({
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
		["Users", reqUser.username, "Games", gameConfig.name, playtype, "Rivals"],
		[reqUser, game, playtype],
		`${reqUser.username}'s ${FormatGame(game, playtype)} Rivals`
	);

	const base = useUGPTBase({ reqUser, game, playtype });

	return (
		<Row>
			<Col xs={12} className="text-center">
				<div className="btn-group">
					<SelectLinkButton to={`${base}/rivals/challenge-board`}>
						<Icon type="satellite-dish" />
						Sent Challenges
					</SelectLinkButton>
					<SelectLinkButton to={`${base}/rivals`}>
						<Icon type="users" />
						Rivals
					</SelectLinkButton>
					<SelectLinkButton to={`${base}/rivals/challenges`}>
						<Icon type="bullseye" />
						Received Challenges
					</SelectLinkButton>
				</div>
				<Divider />
			</Col>
			<Col xs={12}>
				<Switch>
					<Route exact path="/dashboard/users/:userID/games/:game/:playtype/rivals">
						<RivalsOverviewPage reqUser={reqUser} game={game} playtype={playtype} />
					</Route>
					<Route
						exact
						path="/dashboard/users/:userID/games/:game/:playtype/rivals/challenge-board"
					></Route>
					<Route
						exact
						path="/dashboard/users/:userID/games/:game/:playtype/rivals/challenges"
					>
						<ReceivedChallengesPage reqUser={reqUser} game={game} playtype={playtype} />
					</Route>
				</Switch>
			</Col>
		</Row>
	);
}
