import useSetSubheader from "components/layout/header/useSetSubheader";
import Divider from "components/util/Divider";
import Icon from "components/util/Icon";
import SelectLinkButton from "components/util/SelectLinkButton";
import useUGPTBase from "components/util/useUGPTBase";
import React from "react";
import { Col, Row } from "react-bootstrap";
import { Route, Switch } from "react-router-dom";
import { FormatGame, Game, GetGameConfig, Playtype, PublicUserDocument } from "tachi-common";
import RivalsManagePage from "./RivalsManagePage";

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
					<SelectLinkButton to={`${base}/rivals/targets`}>
						<Icon type="bullseye" />
						Goals & Milestones
					</SelectLinkButton>
					<SelectLinkButton to={`${base}/rivals/compare`}>
						<Icon type="balance-scale-left" />
						Compare
					</SelectLinkButton>
					<SelectLinkButton to={`${base}/rivals`}>
						<Icon type="list" />
						Activity
					</SelectLinkButton>
					<SelectLinkButton to={`${base}/rivals/folders`}>
						<Icon type="thumbtack" />
						Manage Folders
					</SelectLinkButton>
					<SelectLinkButton to={`${base}/rivals/manage`}>
						<Icon type="users" />
						Change Rivals
					</SelectLinkButton>
				</div>
				<Divider />
			</Col>
			<Col xs={12}>
				<Switch>
					<Route exact path="/dashboard/users/:userID/games/:game/:playtype/rivals">
						activity
					</Route>

					<Route
						exact
						path="/dashboard/users/:userID/games/:game/:playtype/rivals/manage"
					>
						<RivalsManagePage reqUser={reqUser} game={game} playtype={playtype} />
					</Route>

					<Route
						exact
						path="/dashboard/users/:userID/games/:game/:playtype/rivals/folders"
					>
						folders
					</Route>

					<Route
						exact
						path="/dashboard/users/:userID/games/:game/:playtype/rivals/targets"
					>
						goals milestones
					</Route>

					<Route
						exact
						path="/dashboard/users/:userID/games/:game/:playtype/rivals/compare"
					>
						compare
					</Route>
				</Switch>
			</Col>
		</Row>
	);
}
