import { CreateGoalMap } from "util/data";
import useSetSubheader from "components/layout/header/useSetSubheader";
import Quest from "components/targets/quests/Quest";
import ApiError from "components/util/ApiError";
import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import React from "react";
import { Link, useParams } from "react-router-dom";
import { GetGameConfig } from "tachi-common";
import { QuestReturn } from "types/api-returns";
import { GamePT } from "types/react";
import { Col } from "react-bootstrap";
import Divider from "components/util/Divider";

export default function QuestPage({ game, playtype }: GamePT) {
	const { questID } = useParams<{ questID: string }>();

	const { data, error } = useApiQuery<QuestReturn>(
		`/games/${game}/${playtype}/targets/quests/${questID}`
	);

	useSetSubheader(
		[
			"Games",
			GetGameConfig(game).name,
			playtype,
			"Quests",
			data ? data.quest.name : "Loading...",
		],
		[game, playtype],
		data ? data.quest.name : "Loading..."
	);

	if (error) {
		return <ApiError error={error} />;
	}

	if (!data) {
		return <Loading />;
	}

	const { quest, goals } = data;

	const goalMap = CreateGoalMap(goals);

	return (
		<div>
			<Col xs={12}>
				<Link to={`/dashboard/games/${game}/${playtype}/quests`}>
					Go back to all quests...
				</Link>
				<Divider />
				<Quest goals={goalMap} quest={quest} />
			</Col>
		</div>
	);
}
