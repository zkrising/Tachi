import { ChangeAtPosition, DeleteInPosition } from "util/misc";
import useSetSubheader from "components/layout/header/useSetSubheader";
import EditableQuest from "components/quests/editor/EditableQuest";
import AddNewQuestModal from "components/targets/AddNewQuestModal";
import Divider from "components/util/Divider";
import Icon from "components/util/Icon";
import { TachiConfig } from "lib/config";
import p from "prudence";
import React, { useEffect, useState } from "react";
import { Button, Col, Row } from "react-bootstrap";
import { GetGameConfig } from "tachi-common";
import { PR_GOAL_SCHEMA } from "tachi-common/lib/schemas";
import { RawQuestDocument } from "types/tachi";

const LOCAL_QUEST_KEY = "LOCAL_QUESTS";

function GetLocalQuests(): Array<RawQuestDocument> {
	try {
		const data = window.localStorage.getItem(LOCAL_QUEST_KEY);

		if (!data) {
			return [];
		}

		const json = JSON.parse(data);

		// check that this data is what it seems
		const err = p(
			{ json },
			{
				json: [
					{
						game: p.isIn(TachiConfig.games),
						playtype: (self, parent) => {
							const gameConfig = GetGameConfig(parent.game as any);

							if (!gameConfig.validPlaytypes.includes(self)) {
								return `Invalid playtype '${self}' for ${parent.game}`;
							}

							return true;
						},
						name: "string",
						desc: "string",
						criteria: p.or(
							{
								type: p.is("all"),
							},
							{
								type: p.is("total"),
								value: p.isPositiveInteger,
							}
						),
						rawQuestData: [
							{
								title: "string",
								desc: p.optional("string"),
								rawGoals: [
									{
										goal: {
											name: "string",
											charts: PR_GOAL_SCHEMA.charts,
											criteria: PR_GOAL_SCHEMA.criteria,
										},
										note: p.optional("string"),
									},
								],
							},
						],
					},
				],
			}
		);

		if (err) {
			const e = confirm(
				`Failed to validate your local quests: ${err.message}. DELETE ALL AND START AGAIN?`
			);

			if (e) {
				return [];
			}
		}

		return json;
	} catch (err) {
		console.error(err);

		return [];
	}
}

export default function QuestEditor() {
	useSetSubheader(["Developer Utils", "Quest Creator"]);

	const [quests, setQuests] = useState(GetLocalQuests());
	const [show, setShow] = useState(false);

	useEffect(() => {
		window.localStorage.setItem(LOCAL_QUEST_KEY, JSON.stringify(quests));
	}, [quests]);

	return (
		<Row>
			<Col xs={12}>
				<h1>{TachiConfig.name} Quest Editor</h1>
				<Divider />
				<span>
					This tool is for creating your own quests and questlines.
					<br />
					These can be saved to a <code>.json</code> file, and sent to an admin to be
					considered for inclusion on the site!
				</span>
				<Divider />
			</Col>
			{quests.map((quest, i) => (
				<Col className="my-4" xs={12} lg={6} key={i}>
					<EditableQuest
						quest={quest}
						onChange={(quest) => {
							setQuests(ChangeAtPosition(quests, quest, i));
						}}
						onDelete={() => {
							setQuests(DeleteInPosition(quests, i));
						}}
					/>
				</Col>
			))}
			<Col className="my-4" xs={12} lg={6}>
				<div className="w-100 h-100">
					<div className="d-flex w-100 h-100 justify-content-center align-items-center">
						<Button variant="outline-success" onClick={() => setShow(true)}>
							<Icon type="plus" />
							Add New Quest
						</Button>
					</div>
				</div>
			</Col>
			<AddNewQuestModal
				show={show}
				setShow={setShow}
				onCreate={(rawQuest) => setQuests([...quests, rawQuest])}
			/>
		</Row>
	);
}
