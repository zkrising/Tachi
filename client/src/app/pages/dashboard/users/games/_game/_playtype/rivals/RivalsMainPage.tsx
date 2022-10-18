import useSetSubheader from "components/layout/header/useSetSubheader";
import Divider from "components/util/Divider";
import Icon from "components/util/Icon";
import SelectLinkButton from "components/util/SelectLinkButton";
import useLUGPTSettings from "components/util/useLUGPTSettings";
import useUGPTBase from "components/util/useUGPTBase";
import React from "react";
import { Col, Row } from "react-bootstrap";
import { Redirect, Route, Switch } from "react-router-dom";
import { FormatGame, Game, GetGameConfig, Playtype, PublicUserDocument } from "tachi-common";
import RivalsComparePage from "./RivalsComparePage";
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

	const { settings } = useLUGPTSettings();

	if (!settings) {
		return <div>You have no settings set. How did you cause this?</div>;
	}

	return (
		<Row>
			<Col xs={12} className="text-center">
				<div className="btn-group">
					<SelectLinkButton to={`${base}/rivals/targets`}>
						<Icon type="bullseye" />
						Goals & Quests
					</SelectLinkButton>
					<SelectLinkButton matchIfStartsWith to={`${base}/rivals/compare`}>
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
						Manage Rivals
					</SelectLinkButton>
				</div>
				<Divider />
			</Col>
			<Col xs={12}>
				<Switch>
					<Route exact path="/dashboard/users/:userID/games/:game/:playtype/rivals">
						{settings?.rivals.length === 0 && <Redirect to={`${base}/rivals/manage`} />}
						NOT WRITTEN YET
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
						NOT IMPLEMENTED YET
					</Route>

					<Route
						exact
						path="/dashboard/users/:userID/games/:game/:playtype/rivals/targets"
					>
						NOT IMPLEMENTED YET
					</Route>

					<Route path="/dashboard/users/:userID/games/:game/:playtype/rivals/compare">
						<RivalsComparePage reqUser={reqUser} game={game} playtype={playtype} />
					</Route>
				</Switch>
			</Col>
		</Row>
	);
}
