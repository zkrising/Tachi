import { APIFetchV1 } from "util/api";
import { CreateSongMap } from "util/data";
import { useFormik } from "formik";
import React, { ChangeEventHandler, useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import {
	FolderDocument,
	FormatDifficulty,
	Game,
	GetGamePTConfig,
	PublicUserDocument,
	ShowcaseStatDetails,
} from "tachi-common";
import { GamePT, SetState } from "types/react";
import { Playtype } from "types/tachi";
import { SongChartsSearch } from "types/api-returns";
import DebounceSearch from "components/util/DebounceSearch";

interface Props {
	reqUser: PublicUserDocument;
	game: Game;
	playtype: Playtype;
	onCreate: (stat: ShowcaseStatDetails) => void;
	show: boolean;
	setShow: SetState<boolean>;
}

export default function UGPTStatCreator({
	reqUser,
	game,
	playtype,
	onCreate,
	show,
	setShow,
}: Props) {
	const formik = useFormik({
		initialValues: {
			mode: "chart",
			property: "lamp",
			folderID: undefined,
			chartID: undefined,
		},
		onSubmit: values => {
			let stat: ShowcaseStatDetails;

			if (values.mode === "chart") {
				stat = {
					mode: "chart",
					property: values.property as ShowcaseStatDetails["property"],
					chartID: values.chartID ?? "",
				};
			} else if (values.mode === "folder") {
				stat = {
					mode: "folder",
					property: values.property as "lamp" | "score" | "percent" | "grade",
					folderID: values.folderID ?? "",
					gte,
				};
			} else {
				throw new Error(`Unknown values.mode ${values.mode}.`);
			}

			onCreate(stat);
			setShow(false);
		},
	});

	useEffect(() => {
		if (formik.values.mode === "folder" && formik.values.property === "playcount") {
			formik.setValues({ ...formik.values, property: "lamp" });
		}
	}, [formik.values.mode]);

	const [chartData, setChartData] = useState<{ chartID: string; name: string }[]>([]);
	const [chartSearch, setChartSearch] = useState("");

	const [folderData, setFolderData] = useState<{ folderID: string; name: string }[]>([]);
	const [folderSearch, setFolderSearch] = useState("");

	const [gte, setGte] = useState(0);

	useEffect(() => {
		(async () => {
			const search = folderSearch;
			const params = new URLSearchParams({
				search,
			});

			const res = await APIFetchV1<FolderDocument[]>(
				`/games/${game}/${playtype}/folders?${params.toString()}`,
				{},
				false,
				true
			);

			if (!res.success) {
				throw new Error(res.description);
			}

			setFolderData(res.body.map(e => ({ folderID: e.folderID, name: e.title })));
		})();
	}, [folderSearch]);

	useEffect(() => {
		(async () => {
			const search = chartSearch;
			const params = new URLSearchParams({
				search,
			});

			const res = await APIFetchV1<SongChartsSearch>(
				`/games/${game}/${playtype}/charts?${params.toString()}`,
				{},
				false,
				true
			);

			if (!res.success) {
				throw new Error(res.description);
			}

			const songMap = CreateSongMap(res.body.songs);

			const data = [];
			for (const chart of res.body.charts) {
				const song = songMap.get(chart.songID);

				data.push({
					chartID: chart.chartID,
					name: `${song!.title} ${FormatDifficulty(chart, game)}`,
				});
			}

			setChartData(data);
		})();
	}, [chartSearch]);

	return (
		<Modal show={show} onHide={() => setShow(false)}>
			<Modal.Header closeButton>
				<Modal.Title>Showcase Stat Creator</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form onSubmit={formik.handleSubmit}>
					<Form.Group>
						<Form.Label>Mode</Form.Label>
						<Form.Control
							as="select"
							id="mode"
							value={formik.values.mode}
							onChange={formik.handleChange}
						>
							<option value="chart">Chart</option>
							<option value="folder">Folder</option>
						</Form.Control>
						<Form.Text>What kind of stat should this be?</Form.Text>
					</Form.Group>
					<Form.Group>
						<Form.Label>Property</Form.Label>
						<Form.Control
							as="select"
							id="property"
							value={formik.values.property}
							onChange={formik.handleChange}
						>
							<option value="lamp">Lamp</option>
							<option value="grade">Grade</option>
							<option value="percent">Percent</option>
							<option value="score">Score</option>
							{formik.values.mode === "chart" && (
								<option value="playcount">Playcount</option>
							)}
						</Form.Control>
						<Form.Text>What kind of statistic should this check for?</Form.Text>
					</Form.Group>
					{formik.values.mode === "chart" ? (
						<Form.Group>
							<Form.Label>Chart</Form.Label>
							<DebounceSearch setSearch={setChartSearch} placeholder="Chart Name" />
							{chartData.length ? (
								<Form.Control
									id="chartID"
									value={formik.values.chartID}
									onChange={formik.handleChange}
									as="select"
									className="mt-4"
								>
									<option value="">Select a chart...</option>
									{chartData.map((e, i) => (
										<option key={i} value={e.chartID}>
											{e.name}
										</option>
									))}
								</Form.Control>
							) : (
								<></>
							)}
						</Form.Group>
					) : (
						<>
							<Form.Group>
								<Form.Label>Target</Form.Label>
								<FolderGTESelect
									value={gte}
									onChange={e => setGte(Number(e.target.value))}
									{...{
										game,
										playtype,
										property: formik.values.property,
									}}
								/>
							</Form.Group>
							<Form.Group>
								<Form.Label>Folder</Form.Label>
								<DebounceSearch
									setSearch={setFolderSearch}
									placeholder="Folder Name"
								/>
								{folderData.length ? (
									<Form.Control
										id="folderID"
										value={formik.values.folderID}
										onChange={formik.handleChange}
										as="select"
										className="mt-4"
									>
										<option value="">Select a folder...</option>
										{folderData.map((e, i) => (
											<option key={i} value={e.folderID}>
												{e.name}
											</option>
										))}
									</Form.Control>
								) : (
									<></>
								)}
							</Form.Group>
						</>
					)}
					<Form.Group className="d-flex justify-content-end">
						<Button
							disabled={formik.values.mode === "chart" && !formik.values.chartID}
							type="submit ml-auto"
						>
							Submit
						</Button>
					</Form.Group>
				</Form>
			</Modal.Body>
		</Modal>
	);
}

function FolderGTESelect({
	property,
	game,
	playtype,
	value,
	onChange,
}: {
	property: string;
	value: number;
	onChange: ChangeEventHandler<HTMLSelectElement | HTMLInputElement>;
} & GamePT) {
	const gptConfig = GetGamePTConfig(game, playtype);

	const props = { value, onChange };
	if (property === "grade") {
		return (
			<select className="form-control" {...props}>
				{gptConfig.grades.map((e, i) => (
					<option key={i} value={i}>
						{e}
					</option>
				))}
			</select>
		);
	} else if (property === "lamp" || property === "playcount") {
		return (
			<select className="form-control" {...props}>
				{gptConfig.lamps.map((e, i) => (
					<option key={i} value={i}>
						{e}
					</option>
				))}
			</select>
		);
	} else if (property === "percent") {
		return (
			<input
				className="form-control"
				type="number"
				min={0}
				max={gptConfig.percentMax}
				{...props}
			/>
		);
	} else if (property === "score") {
		return <input className="form-control" type="number" min={0} {...props} />;
	}

	throw new Error(`Invalid property ${property}.`);
}
