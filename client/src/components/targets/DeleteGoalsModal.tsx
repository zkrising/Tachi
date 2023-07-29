import { NumericSOV } from "util/sorts";
import QuickTooltip from "components/layout/misc/QuickTooltip";
import Icon from "components/util/Icon";
import React from "react";
import { Button, Col, Modal, Row } from "react-bootstrap";
import { SetState } from "types/react";
import { GoalSubDataset } from "types/tables";
import { InnerQuestSectionGoal } from "./quests/Quest";

export default function DeleteGoalsModal({
	show,
	setShow,
	dataset,
	onDelete,
}: {
	show: boolean;
	setShow: SetState<boolean>;
	dataset: GoalSubDataset;
	onDelete: (goalID: string) => void;
}) {
	const deletableGoals = dataset.filter((e) => e.__related.parentQuests.length === 0);

	const sorted = dataset.slice(0).sort(NumericSOV((x) => x.__related.parentQuests.length));

	return (
		<Modal size="xl" show={show} onHide={() => setShow(false)}>
			<Modal.Header closeButton>
				<Modal.Title>Delete Goals</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Row>
					{deletableGoals.length === 0 && (
						<Col xs={12} className="text-center">
							You have no deletable goals.
						</Col>
					)}
					{sorted.map((e) => (
						<Col xs={12} lg={8} key={e.goalID} className="offset-lg-2 my-2">
							<div className="d-flex">
								<div className="w-100">
									<InnerQuestSectionGoal
										goal={e.__related.goal}
										dependencies={e.__related.parentQuests.map((e) => e.name)}
									/>
								</div>
								<div className="ms-auto ps-4">
									{e.__related.parentQuests.length === 0 ? (
										<Button
											variant="outline-danger"
											onClick={() => onDelete(e.goalID)}
										>
											<Icon type="trash" noPad />
										</Button>
									) : (
										<QuickTooltip tooltipContent="This goal is depended on by quests you're subscribed to, and can't be deleted.">
											<Button variant="outline-secondary" disabled>
												<Icon type="times-circle" noPad />
											</Button>
										</QuickTooltip>
									)}
								</div>
							</div>
						</Col>
					))}
				</Row>
			</Modal.Body>
		</Modal>
	);
}
