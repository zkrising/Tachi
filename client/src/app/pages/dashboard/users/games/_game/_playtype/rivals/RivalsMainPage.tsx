import ScoreLeaderboard from "components/game/ScoreLeaderboard";
import useSetSubheader from "components/layout/header/useSetSubheader";
import Divider from "components/util/Divider";
import Icon from "components/util/Icon";
import SelectLinkButton from "components/util/SelectLinkButton";
import useLUGPTSettings from "components/util/useLUGPTSettings";
import useUGPTBase from "components/util/useUGPTBase";
import React from "react";
import { Col, Row } from "react-bootstrap";
import { Redirect, Route, Switch } from "react-router-dom";
import { FormatGame, Game, GetGameConfig, Playtype, UserDocument } from "tachi-common";
import RivalsActivityPage from "./RivalsActivityPage";
import RivalsManagePage from "./RivalsManagePage";

export default function RivalsMainPage({
	reqUser,
	game,
	playtype,
}: {
	reqUser: UserDocument;
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

	const { settings } = useLUGPTSettings();

	if (!settings) {
		return <div>You have no settings set. How did you cause this?</div>;
	}

	return (
		<Row>
			<Col xs={12} className="text-center">
				<div className="btn-group d-flex justify-content-center">
					<SelectLinkButton to={`${base}/rivals/pb-leaderboard`}>
						<Icon type="sort-amount-up" />
						Rival's Bests
					</SelectLinkButton>
					<SelectLinkButton to={`${base}/rivals`}>
						<Icon type="list" />
						Rival Activity
					</SelectLinkButton>
					<SelectLinkButton to={`${base}/rivals/manage`}>
						<Icon type="users" />
						Manage Rivals
					</SelectLinkButton>
				</div>
				<Divider />
			</Col>
			<Col xs={12}>
				<Switch>
					<Route exact path="/dashboard/users/:userID/games/:game/:playtype/rivals">
						{settings?.rivals.length === 0 && <Redirect to={`${base}/rivals/manage`} />}
						<RivalsActivityPage reqUser={reqUser} game={game} playtype={playtype} />
					</Route>

					<Route
						exact
						path="/dashboard/users/:userID/games/:game/:playtype/rivals/manage"
					>
						<RivalsManagePage reqUser={reqUser} game={game} playtype={playtype} />
					</Route>

					<Route
						exact
						path="/dashboard/users/:userID/games/:game/:playtype/rivals/pb-leaderboard"
					>
						<ScoreLeaderboard
							game={game}
							playtype={playtype}
							refreshDeps={[`rivals-pb-leaderboard-${settings.rivals.join(",")}`]}
							url={`/users/${reqUser.id}/games/${game}/${playtype}/rivals/pb-leaderboard`}
						/>
					</Route>
				</Switch>
			</Col>
		</Row>
	);
}
