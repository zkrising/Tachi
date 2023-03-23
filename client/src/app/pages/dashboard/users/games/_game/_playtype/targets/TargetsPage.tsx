import useSetSubheader from "components/layout/header/useSetSubheader";
import Divider from "components/util/Divider";
import Icon from "components/util/Icon";
import SelectLinkButton from "components/util/SelectLinkButton";
import useUGPTBase from "components/util/useUGPTBase";
import React from "react";
import { Col, Row } from "react-bootstrap";
import { Route, Switch } from "react-router-dom";
import { FormatGame, GetGameConfig } from "tachi-common";
import { UGPT } from "types/react";
import UGPTGoalsPage from "./UGPTGoalsPage";
import UGPTQuestsPage from "./UGPTQuestsPage";

export default function TargetsPage({ reqUser, game, playtype }: UGPT) {
	const gameConfig = GetGameConfig(game);

	useSetSubheader(
		["Users", reqUser.username, "Games", gameConfig.name, playtype, "Goals & Quests"],
		[reqUser, game, playtype],
		`${reqUser.username}'s ${FormatGame(game, playtype)} Goals & Quests`
	);

	const base = useUGPTBase({ reqUser, game, playtype });

	return (
		<Row>
			<Col xs={12} className="text-center">
				<div className="btn-group d-flex justify-content-center">
					<SelectLinkButton to={`${base}/targets`}>
						<Icon type="scroll" />
						Quests
					</SelectLinkButton>
					<SelectLinkButton to={`${base}/targets/goals`}>
						<Icon type="bullseye" />
						Goals
					</SelectLinkButton>
				</div>
				<Divider />
			</Col>
			<Col xs={12}>
				<Switch>
					<Route exact path="/u/:userID/games/:game/:playtype/targets/goals">
						<UGPTGoalsPage {...{ reqUser, game, playtype }} />
					</Route>
					<Route exact path="/u/:userID/games/:game/:playtype/targets">
						<UGPTQuestsPage {...{ reqUser, game, playtype }} />
					</Route>
				</Switch>
			</Col>
		</Row>
	);
}
