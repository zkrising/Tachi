import { CreateGoalSubDataset } from "util/data";
import GoalSubInfo from "components/targets/GoalSubInfo";
import ApiError from "components/util/ApiError";
import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import React from "react";
import { Col } from "react-bootstrap";
import { AllUGPTGoalsReturn } from "types/api-returns";
import { UGPT } from "types/react";

export default function GoalsPage({ reqUser, game, playtype }: UGPT) {
	const { data, error } = useApiQuery<AllUGPTGoalsReturn>(
		`/users/${reqUser.id}/games/${game}/${playtype}/targets/goals`
	);

	if (error) {
		return <ApiError error={error} />;
	}

	if (!data) {
		return <Loading />;
	}

	const userMap = new Map([[reqUser.id, reqUser]]);

	const dataset = CreateGoalSubDataset(data, userMap);

	return (
		<div>
			<Col xs={12}>
				<GoalSubInfo dataset={dataset} game={game} playtype={playtype} />
			</Col>
		</div>
	);
}
