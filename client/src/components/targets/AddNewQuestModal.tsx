import Divider from "components/util/Divider";
import Select from "components/util/Select";
import { TachiConfig } from "lib/config";
import React, { useState } from "react";
import { Button, Col, Modal, Row } from "react-bootstrap";
import { FormatGame, Game, GetGameConfig, IDStrings, Playtype } from "tachi-common";
import { SetState } from "types/react";
import { RawQuestDocument } from "types/tachi";

export default function AddNewQuestModal({
	show,
	setShow,
	onCreate,
}: {
	show: boolean;
	setShow: SetState<boolean>;
	onCreate: (rawQuest: RawQuestDocument) => void;
}) {
	const [gpt, setGPT] = useState<IDStrings | null>(null);

	return (
		<Modal size="xl" show={show} onHide={() => setShow(false)}>
			<Modal.Header closeButton>
				<Modal.Title>Create New Quest</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Row>
					<Col xs={12}>
						<Select
							value={gpt}
							setValue={setGPT}
							allowNull
							className="w-100"
							unselectedName="Select a game..."
						>
							{TachiConfig.games.flatMap((game) => {
								const gameConfig = GetGameConfig(game);

								return gameConfig.playtypes.map((playtype) => (
									<option
										key={`${game}:${playtype}`}
										value={`${game}:${playtype}`}
									>
										{FormatGame(game, playtype)}
									</option>
								));
							})}
						</Select>
						<Divider />
					</Col>
					<Col xs={12} className="w-100 d-flex justify-content-center">
						<Button
							variant="primary"
							onClick={() => {
								if (!gpt) {
									return;
								}

								setShow(false);
								const [game, playtype] = gpt.split(":") as [Game, Playtype];
								onCreate({
									game,
									playtype,
									name: "Untitled Quest",
									desc: "Please set a description.",
									rawQuestData: [],
								});
							}}
							disabled={gpt === null}
						>
							Add Quest
						</Button>
					</Col>
				</Row>
			</Modal.Body>
		</Modal>
	);
}
