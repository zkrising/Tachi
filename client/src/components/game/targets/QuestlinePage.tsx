import { CreateGoalMap } from "util/data";
import { CreateQuestMap } from "util/misc";
import useSetSubheader from "components/layout/header/useSetSubheader";
import Quest from "components/targets/quests/Quest";
import ApiError from "components/util/ApiError";
import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import React from "react";
import { Link, useParams } from "react-router-dom";
import { GetGameConfig } from "tachi-common";
import { QuestlineReturn } from "types/api-returns";
import { GamePT } from "types/react";
import { Col, Row } from "react-bootstrap";
import Questline from "components/targets/Questline";
import Divider from "components/util/Divider";

export default function QuestlinePage({ game, playtype }: GamePT) {
	const { questlineID } = useParams<{ questlineID: string }>();

	const { data, error } = useApiQuery<QuestlineReturn>(
		`/games/${game}/${playtype}/targets/questlines/${questlineID}`
	);

	useSetSubheader(
		[
			"Games",
			GetGameConfig(game).name,
			playtype,
			"Quests",
			data ? data.questline.name : "Loading...",
		],
		[game, playtype, data],
		data ? data.questline.name : "Loading..."
	);

	if (error) {
		return <ApiError error={error} />;
	}

	if (!data) {
		return <Loading />;
	}

	const goalMap = CreateGoalMap(data.goals);

	const questMap = CreateQuestMap(data.quests);

	return (
		<Row>
			<Col xs={12}>
				<Link to={`/dashboard/games/${game}/${playtype}/quests`}>
					Go back to all questlines...
				</Link>
				<Divider />
				<Questline questline={data.questline} quests={questMap} />
				<Divider />
			</Col>
			{data.questline.quests.map((questID) => {
				const quest = questMap.get(questID);

				if (!quest) {
					// shouldn't happen, but paste over it.
					return null;
				}

				return (
					<Col
						id={quest.questID}
						xs={12}
						lg={8}
						className="offset-lg-2 my-4 quest-anchor"
						key={quest.questID}
					>
						<Quest quest={quest} goals={goalMap} collapsible />
					</Col>
				);
			})}
		</Row>
	);
}
