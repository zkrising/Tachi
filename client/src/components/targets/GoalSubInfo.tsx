import Divider from "components/util/Divider";
import React, { useMemo, useState } from "react";
import { Col, Form } from "react-bootstrap";
import { GamePT } from "types/react";
import { GoalSubDataset } from "types/tables";
import { InnerQuestSectionGoal } from "./quests/Quest";

export default function GoalSubInfo({ dataset }: { dataset: GoalSubDataset } & GamePT) {
	const [hideAchieved, setHideAchieved] = useState(false);

	const { directGoals, folderGoals } = useMemo(() => {
		let baseDataset = dataset;

		if (hideAchieved) {
			baseDataset = baseDataset.filter((e) => e.achieved === false);
		}

		return {
			directGoals: baseDataset.filter(
				(e) =>
					e.__related.goal.charts.type === "single" ||
					e.__related.goal.charts.type === "multi"
			),
			folderGoals: baseDataset.filter((e) => e.__related.goal.charts.type === "folder"),
		};
	}, [hideAchieved]);

	return (
		<>
			<Col xs={12}>
				<div className="pl-6">
					<div className="d-flex w-100 justify-content-start">
						<Form.Check
							onChange={() => setHideAchieved(!hideAchieved)}
							checked={hideAchieved}
							label="Hide Achieved Goals"
						/>
					</div>
				</div>
				<Divider />
			</Col>
			<Col xs={12}>
				{directGoals.length !== 0 && (
					<div className="pl-6">
						{directGoals.map((e, i) => (
							<div className="pb-2 text-left" key={i}>
								<InnerQuestSectionGoal
									goal={e.__related.goal}
									dependencies={e.__related.parentQuests.map((e) => e.name)}
								/>
							</div>
						))}
					</div>
				)}
				{folderGoals.length !== 0 && directGoals.length !== 0 && <Divider />}
				{folderGoals.length !== 0 && (
					<div className="pl-6">
						{folderGoals.map((e, i) => (
							<div className="pb-2 text-left" key={i}>
								<InnerQuestSectionGoal
									goal={e.__related.goal}
									dependencies={e.__related.parentQuests.map((e) => e.name)}
								/>
							</div>
						))}
					</div>
				)}
				{folderGoals.length === 0 && directGoals.length === 0 && (
					<div>You've got no goals related to this chart.</div>
				)}
			</Col>
		</>
	);
}
