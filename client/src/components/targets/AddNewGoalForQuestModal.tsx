import { APIFetchV1 } from "util/api";
import { CreateSongMap } from "util/data";
import { StrSOV } from "util/sorts";
import AsyncSelect from "components/util/AsyncSelect";
import Divider from "components/util/Divider";
import Select from "components/util/Select";
import React, { useEffect, useState } from "react";
import { Button, Col, Form, InputGroup, Modal, Row } from "react-bootstrap";
import { FolderDocument, FormatChart, GetGamePTConfig, GoalDocument } from "tachi-common";
import { SongChartsSearch } from "types/api-returns";
import { GamePT, SetState } from "types/react";
import { RawQuestGoal } from "types/tachi";
import { OptionsOrGroups, GroupBase } from "react-select";
import { RenderGoalCriteriaPicker } from "./SetNewGoalModal";

export default function AddNewGoalForQuestModal({
	show,
	setShow,
	game,
	playtype,
	onCreate,
	noNote = false,
	initialState,
}: {
	show: boolean;
	setShow: SetState<boolean>;
	onCreate: (rawGoal: RawQuestGoal) => void;
	initialState?: RawQuestGoal;
	noNote?: boolean;
} & GamePT) {
	const gptConfig = GetGamePTConfig(game, playtype);

	const [criteria, setCriteria] = useState<GoalDocument["criteria"]>(
		initialState?.goal.criteria ?? {
			mode: "single",
			key: gptConfig.scoreBucket === "grade" ? "scoreData.gradeIndex" : "scoreData.lampIndex",
			value:
				gptConfig.scoreBucket === "grade"
					? gptConfig.grades.indexOf(gptConfig.clearGrade)
					: gptConfig.lamps.indexOf(gptConfig.clearLamp),
		}
	);

	const [charts, setCharts] = useState<GoalDocument["charts"]>(
		initialState?.goal.charts ??
			({
				type: "single",
				// dw
				data: null,
			} as any)
	);

	const [note, setNote] = useState(initialState?.note ?? "");

	const [goalName, setGoalName] = useState("...");
	const [goalErr, setGoalErr] = useState<string | null>(null);

	useEffect(() => {
		if ("data" in charts && charts.data === null) {
			return setGoalName("...");
		}

		try {
			APIFetchV1<string>(`/games/${game}/${playtype}/targets/goals/format`, {
				method: "POST",
				body: JSON.stringify({ criteria, charts }),
				headers: { "Content-Type": "application/json" },
			}).then((r) => {
				if (r.success) {
					setGoalName(r.body);
					setGoalErr(null);
				} else {
					const match = /^Invalid goal: (.*)/u.exec(r.description) as
						| [string, string]
						| null;

					if (match) {
						setGoalName("...");
						setGoalErr(match[1]);
					}
				}
			});
		} catch (err) {
			console.error(`Failed to format goal: ${goalName}`);
		}
	}, [charts, criteria]);

	// if a user switches to "single" mode, forcibly change the now-invisible
	// criteria mode to "single".
	useEffect(() => {
		if (charts.type === "single") {
			setCriteria({ mode: "single", key: criteria.key, value: criteria.value });
		}
	}, [charts]);

	return (
		<Modal size="xl" show={show} onHide={() => setShow(false)}>
			<Modal.Header closeButton>
				<Modal.Title>Create New Goal</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Row>
					<Col xs={12} className="text-center mb-4">
						<h4 className="display-4">{goalName}</h4>
						{goalErr && <span className="text-danger">{goalErr}</span>}
					</Col>
					<Col xs={12}>
						<RenderGoalChartPicker
							game={game}
							playtype={playtype}
							charts={charts}
							onChange={(newCharts) => setCharts(newCharts)}
						/>
					</Col>
					<Col className="mt-4" xs={12}>
						<RenderGoalCriteriaPicker
							criteria={criteria}
							charts={charts}
							setCriteria={setCriteria}
							game={game}
							playtype={playtype}
						/>

						{/* don't render if charts.data is null */}
						{!("data" in charts && charts.data === null) && <Divider />}
					</Col>
					{!noNote && (
						<Col xs={12} className="mt-4">
							<InputGroup>
								<InputGroup.Text>Note (optional)</InputGroup.Text>
								<Form.Control
									value={note}
									onChange={(e) => setNote(e.target.value)}
									placeholder="Optionally, set a note about this goal. Is it particularly noteworthy in this quest?"
								/>
							</InputGroup>

							<Divider />
						</Col>
					)}
					<Col xs={12} className="w-100 mt-4 d-flex justify-content-center">
						<Button
							variant="primary"
							onClick={async () => {
								const res = await APIFetchV1<string>(
									`/games/${game}/${playtype}/targets/goals/format`,
									{
										headers: {
											"Content-Type": "application/json",
										},
										body: JSON.stringify({
											criteria,
											charts,
										}),
										method: "POST",
									},
									false,
									true
								);

								if (res.success) {
									onCreate({
										note: note === "" ? undefined : note,
										goal: {
											name: res.body,
											charts,
											criteria,
										},
									});
									setShow(false);
								}
							}}
							disabled={
								(criteria.mode === "absolute" && criteria.countNum <= 1) ||
								goalName === "..."
							}
						>
							Add Goal
						</Button>
					</Col>
				</Row>
			</Modal.Body>
		</Modal>
	);
}

function RenderGoalChartPicker({
	charts,
	game,
	playtype,
	onChange,
}: {
	charts: GoalDocument["charts"];
	onChange: (charts: GoalDocument["charts"]) => void;
} & GamePT) {
	const [type, setType] = useState<GoalDocument["charts"]["type"]>(charts.type);

	// hackily declaring this as any because type and chartInfo are technically disjoint
	// however, due to the code, these will always be in sync.
	const [data, setData] = useState<any>("data" in charts ? charts.data : null);

	useEffect(
		() =>
			// THIS MIGHT SET DATA AS NULL
			// THIS IS DELIBERATE, AS WE WANT TO REPRESENT THE PARTIAL STATE WHERE THE USER
			// HAS SELECTED SOME TYPE, BUT NOT PICKED A FOLDER/CHART YET.

			// SERIOUSLY. THIS IS SET AS NULL SOMETIMES AND THE TYPESYSTEM DOES NOT REPRESENT
			// THAT FACT.
			onChange({ type, data }),
		[type, data]
	);

	useEffect(() => {
		setData(null);

		onChange({ type, data: null as any });
	}, [type]);

	return (
		<>
			<div>
				On{" "}
				<Select inline value={type} setValue={setType}>
					<option value="folder">A Folder</option>
					<option value="single">A Specific Chart</option>
					<option value="multi">Specific Charts</option>
				</Select>
			</div>

			<div className="mt-4 ">
				{type === "folder" ? (
					<FolderSelect game={game} playtype={playtype} onChange={setData} />
				) : type === "single" ? (
					<ChartSelect game={game} playtype={playtype} onChange={setData} />
				) : (
					<ChartSelect game={game} playtype={playtype} multi onChange={setData} />
				)}
			</div>
		</>
	);
}

function FolderSelect({ game, playtype, onChange }: { onChange: (data: string) => void } & GamePT) {
	let lastTimeout: number | null = null;

	const loadFolderOptions = (
		input: string,
		cb: (options: OptionsOrGroups<unknown, GroupBase<unknown>>) => void
	) => {
		if (lastTimeout !== null) {
			clearTimeout(lastTimeout);
		}

		// debounce this query to only run after 300ms of no more user input.
		lastTimeout = window.setTimeout(async () => {
			const res = await APIFetchV1<Array<FolderDocument>>(
				`/games/${game}/${playtype}/folders?search=${input}`
			);
			if (!res.success) {
				throw new Error(res.description);
			}

			const options = res.body.map((e) => ({
				value: e.folderID,
				label: e.title,
			}));

			options.sort(StrSOV((x) => x.label));

			cb(options);
		}, 300);
	};

	return (
		<AsyncSelect
			loadOptions={loadFolderOptions}
			placeholder="Search for a folder..."
			// @ts-expect-error can't be bothered to figure out these types, they're stupid.
			onChange={(data) => onChange(data.value)}
		/>
	);
}

function ChartSelect({
	game,
	playtype,
	multi = false,
	onChange,
}: { onChange: (data: string | string[]) => void; multi?: boolean } & GamePT) {
	let lastTimeout: number | null = null;

	const loadChartOptions = (
		input: string,
		cb: (options: OptionsOrGroups<unknown, GroupBase<unknown>>) => void
	) => {
		if (lastTimeout !== null) {
			clearTimeout(lastTimeout);
		}

		// debounce this query to only run after 300ms of no more user input.
		lastTimeout = window.setTimeout(async () => {
			const res = await APIFetchV1<SongChartsSearch>(
				`/games/${game}/${playtype}/charts?search=${input}`
			);

			if (!res.success) {
				throw new Error(res.description);
			}

			const songMap = CreateSongMap(res.body.songs);

			const options = res.body.charts.map((e) => ({
				value: e.chartID,
				label: FormatChart(game, songMap.get(e.songID)!, e),
			}));

			options.sort(StrSOV((x) => x.label));

			cb(options);
		}, 300);
	};

	return (
		<AsyncSelect
			loadOptions={loadChartOptions}
			placeholder="Search for a chart..."
			isMulti={multi}
			onChange={(data) =>
				// @ts-expect-error can't be bothered to figure out these types, they're stupid.
				onChange(Array.isArray(data) ? data.map((e) => e.value) : data.value)
			}
		/>
	);
}
