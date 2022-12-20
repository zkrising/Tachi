import useSetSubheader from "components/layout/header/useSetSubheader";
import Card from "components/layout/page/Card";
import { GetGPTUtils, GetGPTUtilsName } from "components/gpt-utils/GPTUtils";
import Divider from "components/util/Divider";
import LinkButton from "components/util/LinkButton";
import { UserContext } from "context/UserContext";
import React, { useContext } from "react";
import { Col, Row } from "react-bootstrap";
import { Link, Route, Switch } from "react-router-dom";
import { FormatGame, GetGameConfig } from "tachi-common";
import { UGPT } from "types/react";
import { GPTUtility } from "types/ugpt";

export default function UGPTUtilsPage({ reqUser, game, playtype }: UGPT) {
	const gameConfig = GetGameConfig(game);
	const { user } = useContext(UserContext);

	const isViewingOwnProfile = user?.id === reqUser.id;

	const utils = GetGPTUtils(game, playtype);
	const pageName = GetGPTUtilsName(game, playtype, isViewingOwnProfile);

	useSetSubheader(
		["Users", reqUser.username, "Games", gameConfig.name, playtype, pageName ?? "Utils"],
		[reqUser, game, playtype],
		`${reqUser.username}'s ${FormatGame(game, playtype)} ${pageName ?? "Utils"}`
	);

	return (
		<Row>
			<Switch>
				<Route exact path="/u/:userID/games/:game/:playtype/utils">
					{utils.map((util) => (
						<Col key={util.urlPath} xs={12} className="my-4" lg={6}>
							<Card
								header={util.name}
								footer={
									<div className="d-flex w-100 justify-content-end">
										<LinkButton
											to={`/u/${reqUser.username}/games/${game}/${playtype}/utils/${util.urlPath}`}
										>
											View
										</LinkButton>
									</div>
								}
							>
								{util.description}
							</Card>
						</Col>
					))}
				</Route>

				{utils.map((tool) => (
					<Route
						key={tool.urlPath}
						exact
						path={`/u/:userID/games/:game/:playtype/utils/${tool.urlPath}`}
					>
						<Col xs={12} className="mt-4">
							<Card
								header={tool.name}
								footer={
									<Link
										to={`/u/${reqUser.username}/games/${game}/${playtype}/utils`}
										className="text-muted text-hover-white"
									>
										&lt; Back to all tools...
									</Link>
								}
							>
								{tool.description}
							</Card>
							<Divider />
						</Col>
						<Col xs={12}>{tool.component({ reqUser, game, playtype })}</Col>
					</Route>
				))}
			</Switch>
		</Row>
	);
}
