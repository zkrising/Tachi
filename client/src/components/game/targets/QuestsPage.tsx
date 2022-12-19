import { CreateGoalMap } from "util/data";
import useSetSubheader from "components/layout/header/useSetSubheader";
import Card from "components/layout/page/Card";
import Questline from "components/targets/Questline";
import Quest from "components/targets/quests/Quest";
import ApiError from "components/util/ApiError";
import Divider from "components/util/Divider";
import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import React from "react";
import { Col, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
	FormatGame,
	GetGameConfig,
	GoalDocument,
	QuestDocument,
	QuestlineDocument,
} from "tachi-common";
import { GamePT } from "types/react";

export default function QuestsPage({ game, playtype }: GamePT) {
	useSetSubheader(
		["Games", GetGameConfig(game).name, playtype, "Quests"],
		[game, playtype],
		`${FormatGame(game, playtype)} Quests`
	);

	return (
		<div>
			<QuestlineSelector game={game} playtype={playtype} />
		</div>
	);
}

function QuestlineSelector({ game, playtype }: GamePT) {
	const { data, error } = useApiQuery<{
		questlines: Array<QuestlineDocument>;
		standalone: Array<QuestDocument>;
		standaloneGoals: Array<GoalDocument>;
	}>(`/games/${game}/${playtype}/targets/questlines`);

	if (error) {
		return <ApiError error={error} />;
	}

	if (!data) {
		return <Loading />;
	}

	if (data.questlines.length === 0 && data.standalone.length === 0) {
		return (
			<Row>
				<Col xs={12}>
					<div className="w-100 text-center">
						Looks like this game has no quests. If you want, you could{" "}
						<Link to="/utils/quests">create your own</Link>, and submit them
						in the discord!
					</div>
				</Col>
			</Row>
		);
	}

	const goalMap = CreateGoalMap(data.standaloneGoals);

	return (
		<Row>
			{data.questlines.map((e) => (
				<Col xs={12} className="my-4" key={e.questlineID}>
					<Questline questline={e} />
				</Col>
			))}
			{data.standalone.length !== 0 && (
				<Col xs={12} className="my-4">
					<Card header="Standalone Quests">
						This game has {data.standalone.length}{" "}
						{data.standalone.length === 1 ? "quest" : "quests"} that don't belong to any
						questlines.
					</Card>

					<Divider />
					<Row>
						{data.standalone.map((e) => (
							<Col xs={12} lg={6} key={e.questID} className="mb-4">
								<Quest goals={goalMap} quest={e} collapsible />
							</Col>
						))}
					</Row>
				</Col>
			)}
		</Row>
	);
}
