import { APIFetchV1 } from "util/api";
import { clamp } from "util/misc";
import Divider from "components/util/Divider";
import Select from "components/util/Select";
import React, { useEffect, useMemo, useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import {
	ChartDocument,
	FolderDocument,
	FormatChart,
	Game,
	GetGamePTConfig,
	GoalDocument,
	Playtype,
	SongDocument,
} from "tachi-common";
import { GamePT, SetState, UGPT } from "types/react";
import CheckEdit from "components/util/CheckEdit";

export default function SetNewGoalModal({
	show,
	setShow,
	game,
	playtype,
	reqUser,
	preData,
	onNewGoalSet,
}: {
	show: boolean;
	setShow: SetState<boolean>;
	onNewGoalSet?: () => void;
	preData: { chart: ChartDocument; song: SongDocument } | FolderDocument;
} & UGPT) {
	const gptConfig = GetGamePTConfig(game, playtype);

	const [criteria, setCriteria] = useState<GoalDocument["criteria"]>({
		mode: "single",
		key: gptConfig.scoreBucket === "grade" ? "scoreData.gradeIndex" : "scoreData.lampIndex",
		value:
			gptConfig.scoreBucket === "grade"
				? gptConfig.grades.indexOf(gptConfig.clearGrade)
				: gptConfig.lamps.indexOf(gptConfig.clearLamp),
	});

	const charts = useMemo<GoalDocument["charts"]>(
		() =>
			"folderID" in preData
				? {
						type: "folder",
						data: preData.folderID,
				  }
				: {
						type: "single",
						data: preData.chart.chartID,
				  },
		[preData]
	);

	const identifier =
		"folderID" in preData
			? `The '${preData.title}' folder`
			: FormatChart(game, preData.song, preData.chart);

	return (
		<Modal size="xl" show={show} onHide={() => setShow(false)}>
			<Modal.Header closeButton>
				<Modal.Title>Set Goal for {identifier}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Row>
					{/* <Col xs={12}>
						<RenderGoalChartSet charts={charts} identifier={identifier} />
					</Col> */}
					<Col xs={12}>
						<RenderGoalCriteriaPicker
							criteria={criteria}
							charts={charts}
							setCriteria={setCriteria}
							game={game}
							playtype={playtype}
						/>

						<Divider />
					</Col>
					<Col xs={12} className="w-100 d-flex justify-content-center">
						<Button
							variant="primary"
							onClick={() => {
								APIFetchV1(
									`/users/${reqUser.id}/games/${game}/${playtype}/targets/goals/add-goal`,
									{
										method: "POST",
										headers: {
											"Content-Type": "application/json",
										},
										body: JSON.stringify({
											criteria,
											charts,
										}),
									},
									true,
									true
								).then((r) => {
									if (r.success) {
										setShow(false);
										onNewGoalSet?.();
									}
								});
							}}
							disabled={criteria.mode === "absolute" && criteria.countNum <= 1}
						>
							Set Goal!
						</Button>
					</Col>
				</Row>
			</Modal.Body>
		</Modal>
	);
}

export function RenderGoalCriteriaPicker({
	criteria,
	charts,
	setCriteria,
	game,
	playtype,
}: {
	criteria: GoalDocument["criteria"];
	setCriteria: SetState<GoalDocument["criteria"]>;
	charts: GoalDocument["charts"];
	game: Game;
	playtype: Playtype;
}) {
	return (
		<>
			<div>
				<Select
					inline
					value={criteria.key}
					setValue={(key) => {
						const baseKeyValue = getBaseKeyValue(game, playtype, key);
						setCriteria({
							...criteria,
							key,
							value: baseKeyValue,
						});
					}}
				>
					<option value="scoreData.score">Score</option>
					<option value="scoreData.percent">Percent</option>
					<option value="scoreData.gradeIndex">Grade</option>
					<option value="scoreData.lampIndex">Lamp</option>
				</Select>
				is greater than or equal to
				<div className="form-group" style={{ display: "inline" }}>
					<CriteriaValuePicker
						criteria={criteria}
						game={game}
						playtype={playtype}
						onChange={(value) =>
							setCriteria({
								...criteria,
								value,
							})
						}
					/>
				</div>
			</div>
			{charts.type !== "single" && (
				<>
					<Divider />
					<CriteriaModePicker
						criteria={criteria}
						charts={charts}
						game={game}
						playtype={playtype}
						onChange={(mode, countNum) => {
							if (mode === "single") {
								setCriteria({
									mode: "single",
									key: criteria.key,
									value: criteria.value,
								});
							} else {
								setCriteria({
									...criteria,
									// shouldn't happen, but default to 0 ig
									countNum: countNum ?? 0,
									mode,
								});
							}
						}}
					/>
				</>
			)}
		</>
	);
}

function CriteriaModePicker({
	criteria,
	onChange,
	charts,
}: {
	criteria: GoalDocument["criteria"];
	charts: GoalDocument["charts"];
	onChange: (value: GoalDocument["criteria"]["mode"], countNum?: number) => void;
} & GamePT) {
	const [absCountNum, setAbsCountNum] = useState(10);
	const [perCountNum, setPerCountNum] = useState(10);

	useEffect(() => {
		if (criteria.mode === "proportion") {
			onChange("proportion", perCountNum / 100);
		} else if (criteria.mode === "absolute") {
			onChange("absolute", absCountNum);
		}
	}, [absCountNum, perCountNum]);

	if ("data" in charts && charts.data === null) {
		return <></>;
	}

	return (
		<>
			<CheckEdit
				type="single"
				currentType={criteria.mode}
				onChange={() => onChange("single")}
			>
				{charts.type === "any"
					? "On any chart"
					: charts.type === "multi"
					? "On any of these charts"
					: "On any chart in this folder"}
			</CheckEdit>
			<CheckEdit
				type="absolute"
				currentType={criteria.mode}
				onChange={() => onChange("absolute", Number(absCountNum))}
			>
				On{" "}
				<Form.Control
					style={{ display: "inline", width: "unset" }}
					className="mx-2"
					onChange={(e) => setAbsCountNum(Number(e.target.value))}
					type="number"
					min={2}
					value={absCountNum}
				/>{" "}
				{charts.type === "any"
					? absCountNum === 1
						? "chart"
						: "charts"
					: charts.type === "multi"
					? "of these charts"
					: "charts in this folder"}
			</CheckEdit>
			{charts.type !== "multi" && (
				<CheckEdit
					type="proportion"
					currentType={criteria.mode}
					onChange={() => onChange("proportion", perCountNum / 100)}
				>
					On
					<Form.Control
						style={{ display: "inline", width: "unset" }}
						className="mx-2"
						onChange={(e) => setPerCountNum(clamp(Number(e.target.value), 0, 100))}
						type="number"
						min={0}
						max={100}
						value={perCountNum}
					/>
					% {charts.type === "any" ? "of all charts" : "of charts in this folder"}
				</CheckEdit>
			)}
		</>
	);
}

function CriteriaValuePicker({
	criteria,
	game,
	playtype,
	onChange,
}: {
	criteria: GoalDocument["criteria"];
	onChange: (value: GoalDocument["criteria"]["value"]) => void;
} & GamePT) {
	const gptConfig = GetGamePTConfig(game, playtype);

	switch (criteria.key) {
		case "scoreData.score":
			return (
				<Form.Control
					style={{ display: "inline", width: "unset" }}
					className="mx-2"
					onChange={(e) => onChange(Number(e.target.value))}
					type="number"
					min={0}
					value={criteria.value}
				/>
			);
		case "scoreData.percent":
			return (
				<Form.Control
					style={{ display: "inline", width: "unset" }}
					className="mx-2"
					onChange={(e) => onChange(Number(e.target.value))}
					type="number"
					value={criteria.value}
					min={0}
					max={gptConfig.percentMax}
				/>
			);
		case "scoreData.gradeIndex":
			return (
				<Select
					inline
					value={criteria.value.toString()}
					setValue={(v) => onChange(Number(v))}
				>
					{gptConfig.grades.map((e, i) => (
						<option key={i} value={i}>
							{e}
						</option>
					))}
				</Select>
			);

		case "scoreData.lampIndex":
			return (
				<Select
					inline
					value={criteria.value.toString()}
					setValue={(v) => onChange(Number(v))}
				>
					{gptConfig.lamps.map((e, i) => (
						<option key={i} value={i}>
							{e}
						</option>
					))}
				</Select>
			);
	}
}

function getBaseKeyValue(game: Game, playtype: Playtype, key: GoalDocument["criteria"]["key"]) {
	const gptConfig = GetGamePTConfig(game, playtype);

	switch (key) {
		case "scoreData.gradeIndex":
			return gptConfig.grades.indexOf(gptConfig.clearGrade);
		case "scoreData.lampIndex":
			return gptConfig.lamps.indexOf(gptConfig.clearLamp);
		default:
			return 0;
	}
}
