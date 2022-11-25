import { CreateGoalSubDataset, CreateUserMap } from "util/data";
import SetNewGoalModal from "components/targets/SetNewGoalModal";
import ApiError from "components/util/ApiError";
import Divider from "components/util/Divider";
import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import React, { useReducer, useState } from "react";
import { Button, Col } from "react-bootstrap";
import { FolderDocument } from "tachi-common";
import { GoalsOnChartReturn, GoalsOnFolderReturn } from "types/api-returns";
import { UGPT } from "types/react";
import GoalSubInfo from "components/targets/GoalSubInfo";

export default function FolderQuestsPage({
	folder,
	game,
	playtype,
	reqUser,
}: {
	folder: FolderDocument;
} & UGPT) {
	const [refresh, forceRefresh] = useReducer((x) => x + 1, 0);

	const { data, error } = useApiQuery<GoalsOnChartReturn>(
		`/users/${reqUser.id}/games/${game}/${playtype}/targets/on-folder/${folder.folderID}`,
		undefined,
		[refresh]
	);

	const [show, setShow] = useState(false);

	return (
		<div>
			<Col xs={12} className="w-100 d-flex justify-content-center">
				<Button variant="outline-success" onClick={() => setShow(true)}>
					Set New Folder Goal
				</Button>
			</Col>
			<Divider />
			{error && <ApiError error={error} />}
			{data ? (
				<FolderQuestsInner {...{ reqUser, game, playtype, folder, data }} />
			) : (
				<Loading />
			)}

			{show && (
				<SetNewGoalModal
					{...{ game, playtype, reqUser, show, setShow }}
					preData={folder}
					onNewGoalSet={forceRefresh}
				/>
			)}
		</div>
	);
}

function FolderQuestsInner({
	reqUser,
	game,
	playtype,
	folder,
	data,
}: {
	data: GoalsOnFolderReturn;
	folder: FolderDocument;
} & UGPT) {
	const userMap = CreateUserMap([reqUser]);

	return (
		<GoalSubInfo
			dataset={CreateGoalSubDataset(data, userMap)}
			game={game}
			playtype={playtype}
		/>
	);
}
