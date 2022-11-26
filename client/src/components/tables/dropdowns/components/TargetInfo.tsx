import { UnsuccessfulAPIFetchResponse } from "util/api";
import { CreateGoalSubDataset, CreateUserMap } from "util/data";
import SetNewGoalModal from "components/targets/SetNewGoalModal";
import ApiError from "components/util/ApiError";
import Divider from "components/util/Divider";
import Loading from "components/util/Loading";
import React, { useState } from "react";
import { Button, Col } from "react-bootstrap";
import { GoalsOnChartReturn } from "types/api-returns";
import { UGPT } from "types/react";
import { ChartDocument, FormatChart, SongDocument } from "tachi-common";
import Icon from "components/util/Icon";
import GoalSubInfo from "components/targets/GoalSubInfo";
import DebugContent from "components/util/DebugContent";

export default function TargetInfo({
	data,
	error,
	game,
	playtype,
	reqUser,
	chart,
	song,
	onGoalSet,
}: {
	data: GoalsOnChartReturn | undefined;
	error: UnsuccessfulAPIFetchResponse | null;
	chart: ChartDocument;
	song: SongDocument;
	onGoalSet: () => void;
} & UGPT) {
	const [show, setShow] = useState(false);

	if (error) {
		return <ApiError error={error} />;
	}

	if (!data) {
		return <Loading />;
	}

	const userMap = CreateUserMap([reqUser]);

	const dataset = CreateGoalSubDataset(data, userMap);

	return (
		<div className="w-100">
			<Col xs={12}>
				<h1>Your Goals on {FormatChart(game, song, chart)}</h1>
				<Divider />
			</Col>
			<Col xs={12}>
				<GoalSubInfo dataset={dataset} game={game} playtype={playtype} />
			</Col>

			<Divider />
			<Button variant="outline-success" onClick={() => setShow(true)}>
				<Icon type="bullseye" />
				Set New Goal
			</Button>
			<SetNewGoalModal
				show={show}
				setShow={setShow}
				game={game}
				playtype={playtype}
				reqUser={reqUser}
				preData={{ chart, song }}
				onNewGoalSet={onGoalSet}
			/>
		</div>
	);
}
