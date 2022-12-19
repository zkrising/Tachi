import useSetSubheader from "components/layout/header/useSetSubheader";
import Card from "components/layout/page/Card";
import { GetGPTInsights } from "components/tools-insights/ToolsAndInsights";
import Divider from "components/util/Divider";
import LinkButton from "components/util/LinkButton";
import React from "react";
import { Col, Row } from "react-bootstrap";
import { Link, Route, Switch } from "react-router-dom";
import { FormatGame, GetGameConfig } from "tachi-common";
import { UGPT } from "types/react";

export default function InsightsPage({ reqUser, game, playtype }: UGPT) {
	const gameConfig = GetGameConfig(game);
	useSetSubheader(
		["Users", reqUser.username, "Games", gameConfig.name, playtype, "Insights"],
		[reqUser, game, playtype],
		`${reqUser.username}'s ${FormatGame(game, playtype)} Insights`
	);

	const insights = GetGPTInsights(game, playtype);

	if (insights.length === 0) {
		return (
			<div className="text-center w-100">
				{FormatGame(game, playtype)} has no insights. How'd you get here!
			</div>
		);
	}

	return (
		<Row>
			<Switch>
				{insights.map((tool) => (
					<Route
						key={tool.urlPath}
						exact
						path={`/u/:userID/games/:game/:playtype/insights/${tool.urlPath}`}
					>
						<Col xs={12} className="mt-4">
							<Card
								header={tool.name}
								footer={
									<Link
										to={`/u/${reqUser.username}/games/${game}/${playtype}/insights`}
										className="text-muted text-hover-white"
									>
										&lt; Back to all insights...
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

				<Route exact path="/u/:userID/games/:game/:playtype/insights/">
					{insights.map((tool) => (
						<Col key={tool.urlPath} xs={12} className="my-4" lg={6}>
							<Card
								header={tool.name}
								footer={
									<div className="d-flex w-100 justify-content-end">
										<LinkButton to={`insights/${tool.urlPath}`}>
											View
										</LinkButton>
									</div>
								}
							>
								{tool.description}
							</Card>
						</Col>
					))}
				</Route>
			</Switch>
		</Row>
	);
}
