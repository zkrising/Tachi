import { ChangeAtPosition, DeleteInPosition } from "util/misc";
import Card from "components/layout/page/Card";
import AddNewGoalForQuestModal from "components/targets/AddNewGoalForQuestModal";
import Divider from "components/util/Divider";
import EditableText from "components/util/EditableText";
import Icon from "components/util/Icon";
import Muted from "components/util/Muted";
import React, { useState } from "react";
import { Button } from "react-bootstrap";
import { FormatGame } from "tachi-common";
import { GamePT } from "types/react";
import { RawQuestDocument, RawQuestGoal, RawQuestSection } from "types/tachi";

export default function EditableQuest({
	quest,
	onChange,
	onDelete,
}: {
	quest: RawQuestDocument;
	onChange: (rq: RawQuestDocument) => void;
	onDelete: () => void;
}) {
	return (
		<Card
			header={
				<div>
					<EditableText
						initial={quest.name}
						onChange={(name) =>
							onChange({
								...quest,
								name,
							})
						}
					>
						{(text) => (
							<h3>
								{text}
								<span className="ml-2">
									<Icon type="pencil-alt" />
								</span>
							</h3>
						)}
					</EditableText>

					<EditableText
						initial={quest.desc}
						onChange={(desc) =>
							onChange({
								...quest,
								desc,
							})
						}
					>
						{(desc) => (
							<div>
								{desc}
								<span className="ml-2">
									<Icon type="pencil-alt" />
								</span>
							</div>
						)}
					</EditableText>

					<div className="mt-4">
						<Muted>Game: {FormatGame(quest.game, quest.playtype)}</Muted>
					</div>
				</div>
			}
		>
			{quest.rawQuestData.map((e, i) => (
				<React.Fragment key={i}>
					<QuestSection
						game={quest.game}
						playtype={quest.playtype}
						section={e}
						onChange={(newSection) =>
							onChange({
								...quest,
								rawQuestData: ChangeAtPosition(quest.rawQuestData, newSection, i),
							})
						}
						onDelete={() =>
							onChange({
								...quest,
								rawQuestData: DeleteInPosition(quest.rawQuestData, i),
							})
						}
					/>
					<Divider />
				</React.Fragment>
			))}
			<div className="d-flex w-100 justify-content-center">
				<Button
					variant="outline-success"
					onClick={() =>
						onChange({
							...quest,
							rawQuestData: [
								...quest.rawQuestData,
								{
									title: "Untitled Section",
									desc: "Give this section a description.",
									rawGoals: [],
								},
							],
						})
					}
				>
					<Icon type="plus" />
					Add New Quest Section
				</Button>
			</div>
			<Divider />
			<div className="d-flex w-100 justify-content-end">
				<Button
					variant="outline-danger"
					onClick={() => {
						if (confirm("Are you absolutely sure you want to delete this quest?")) {
							onDelete();
						}
					}}
				>
					<Icon type="trash" noPad />
				</Button>
			</div>
		</Card>
	);
}

function QuestSection({
	section,
	game,
	playtype,
	onChange,
	onDelete,
}: {
	section: RawQuestSection;
	onChange: (newSection: RawQuestSection) => void;
	onDelete: () => void;
} & GamePT) {
	const [show, setShow] = useState(false);

	return (
		<div>
			<EditableText
				initial={section.title}
				onChange={(title) =>
					onChange({
						...section,
						title,
					})
				}
			>
				{(text) => (
					<h5>
						{text}
						<span className="ml-2">
							<Icon type="pencil-alt" />
						</span>
					</h5>
				)}
			</EditableText>
			<EditableText
				initial={section.desc}
				onChange={(title) =>
					onChange({
						...section,
						title,
					})
				}
			>
				{(desc) => (
					<div>
						{desc}
						<span className="ml-2">
							<Icon type="pencil-alt" />
						</span>
					</div>
				)}
			</EditableText>
			<br />
			{section.rawGoals.length === 0 ? (
				<Muted>No Goals...</Muted>
			) : (
				<ul>
					{section.rawGoals.map((e, i) => (
						<InnerQuestSectionGoal
							rawGoal={e}
							key={i}
							game={game}
							playtype={playtype}
							onInnerGoalChange={(newRawGoal) =>
								onChange({
									...section,
									rawGoals: ChangeAtPosition(section.rawGoals, newRawGoal, i),
								})
							}
							onInnerGoalDelete={() => {
								onChange({
									...section,
									rawGoals: DeleteInPosition(section.rawGoals, i),
								});
							}}
						/>
					))}
				</ul>
			)}
			<br />
			<div className="w-100 d-flex mt-8">
				<Button variant="outline-success" onClick={() => setShow(true)}>
					<Icon type="plus" />
					Add Goal
				</Button>
				<Button
					className="ml-auto"
					variant="outline-danger"
					onClick={() => {
						if (confirm("Are you absolutely sure you want to delete this section?")) {
							onDelete();
						}
					}}
				>
					<Icon type="times" noPad />
				</Button>
			</div>
			{show && (
				<AddNewGoalForQuestModal
					show={show}
					setShow={setShow}
					game={game}
					playtype={playtype}
					onCreate={(rawGoal) => {
						onChange({
							...section,
							rawGoals: [...section.rawGoals, rawGoal],
						});
					}}
				/>
			)}
		</div>
	);
}

function InnerQuestSectionGoal({
	rawGoal,
	game,
	playtype,
	onInnerGoalChange,
	onInnerGoalDelete,
}: {
	rawGoal: RawQuestGoal;
	onInnerGoalChange: (newRawGoal: RawQuestGoal) => void;
	onInnerGoalDelete: () => void;
} & GamePT) {
	const [show, setShow] = useState(false);

	return (
		<li className="quest-goal">
			<div className="w-100">
				{rawGoal.goal.name}

				<span className="float-right">
					<Icon type="pencil-alt" onClick={() => setShow(true)} />
					<span className="ml-2">
						<Icon
							type="trash"
							onClick={() => {
								if (
									confirm(
										`Are you sure you want to remove the goal "${rawGoal.goal.name}"?`
									)
								) {
									onInnerGoalDelete();
								}
							}}
						/>
					</span>
				</span>
			</div>
			{rawGoal.note && <Muted>{rawGoal.note}</Muted>}
			{show && (
				<AddNewGoalForQuestModal
					show={show}
					setShow={setShow}
					game={game}
					playtype={playtype}
					initialState={rawGoal}
					onCreate={(newRawGoal) => {
						onInnerGoalChange(newRawGoal);
					}}
				/>
			)}
		</li>
	);
}
