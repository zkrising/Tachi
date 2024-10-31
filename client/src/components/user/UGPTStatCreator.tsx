import { APIFetchV1 } from "util/api";
import { CreateSongMap } from "util/data";
import { UppercaseFirst } from "util/misc";
import { StrSOV } from "util/sorts";
import { useFormik } from "formik";
import React, { ChangeEventHandler, useContext, useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import {
	FolderDocument,
	FormatDifficulty,
	Game,
	GetGamePTConfig,
	UserDocument,
	ShowcaseStatDetails,
	Playtype,
	GetScoreMetricConf,
	GetScoreMetrics,
} from "tachi-common";
import { GamePT, SetState } from "types/react";
import { SongChartsSearch } from "types/api-returns";
import DebounceSearch from "components/util/DebounceSearch";
import Muted from "components/util/Muted";
import { UserContext } from "context/UserContext";

interface Props {
	reqUser: UserDocument;
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
	return (
		<Modal show={show} onHide={() => setShow(false)}>
			<Modal.Header closeButton>
				<Modal.Title>Showcase Stat Creator</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{show && (
					<UGPTStatInnerSearchyBit
						game={game}
						onCreate={onCreate}
						playtype={playtype}
						reqUser={reqUser}
						setShow={setShow}
						show={show}
					/>
				)}
			</Modal.Body>
		</Modal>
	);
}

function UGPTStatInnerSearchyBit({ game, playtype, onCreate, setShow }: Props) {
	const gptConfig = GetGamePTConfig(game, playtype);

	const formik = useFormik({
		initialValues: {
			mode: "chart",
			metric: GetScoreMetrics(gptConfig, ["DECIMAL", "INTEGER", "ENUM"])[0],
			folderID: undefined,
			chartID: undefined,
		},
		onSubmit: (values) => {
			let stat: ShowcaseStatDetails;

			if (values.mode === "chart") {
				stat = {
					mode: "chart",
					metric: values.metric as ShowcaseStatDetails["metric"],
					chartID: values.chartID ?? "",
				};
			} else if (values.mode === "folder") {
				stat = {
					mode: "folder",
					metric: values.metric as "lamp" | "score" | "percent" | "grade",
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
		if (formik.values.mode === "folder" && formik.values.metric === "playcount") {
			formik.setValues({ ...formik.values, metric: "lamp" });
		}
	}, [formik.values.mode]);

	const { user } = useContext(UserContext);
	const [chartData, setChartData] = useState<{ chartID: string; name: string }[]>([]);
	const [chartSearch, setChartSearch] = useState("");
	const [requesterHasPlayed, setRequesterHasPlayed] = useState(user !== null);

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

			setFolderData(
				res.body
					.map((e) => ({ folderID: e.folderID, name: e.title }))
					.sort(StrSOV((e) => e.name))
			);
		})();
	}, [folderSearch]);

	useEffect(() => {
		(async () => {
			const search = chartSearch;
			const params = new URLSearchParams({
				search,
			});

			if (requesterHasPlayed) {
				params.set("requesterHasPlayed", "true");
			}

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

			data.sort(StrSOV((e) => e.name));

			setChartData(data);
		})();
	}, [chartSearch, requesterHasPlayed]);

	return (
		<Form onSubmit={formik.handleSubmit} className="d-flex flex-column gap-4">
			<Form.Group className="d-flex flex-column">
				<Form.Label>Mode</Form.Label>
				<Form.Select id="mode" value={formik.values.mode} onChange={formik.handleChange}>
					<option value="chart">Chart</option>
					<option value="folder">Folder</option>
				</Form.Select>
				<Form.Text>What kind of stat should this be?</Form.Text>
			</Form.Group>
			<Form.Group className="d-flex flex-column">
				<Form.Label>Property</Form.Label>
				<Form.Select
					id="metric"
					value={formik.values.metric}
					onChange={formik.handleChange}
				>
					{GetScoreMetrics(gptConfig, ["DECIMAL", "INTEGER", "ENUM"]).map((e) => (
						<option key={e} value={e}>
							{UppercaseFirst(e)}
						</option>
					))}
					{formik.values.mode === "chart" && <option value="playcount">Playcount</option>}
				</Form.Select>
				<Form.Text>What kind of statistic should this check for?</Form.Text>
			</Form.Group>
			{formik.values.mode === "chart" ? (
				<Form.Group className="d-flex flex-column">
					<Form.Label>Chart</Form.Label>
					<DebounceSearch setSearch={setChartSearch} placeholder="Chart Name" />
					{user && (
						<Form.Check
							id="requesterHasPlayed"
							checked={requesterHasPlayed}
							onChange={(e) => setRequesterHasPlayed(e.target.checked)}
							className="mt-4 mb-4"
							label="Only show charts you've played?"
						/>
					)}
					{chartData.length ? (
						<Form.Select
							id="chartID"
							value={formik.values.chartID}
							onChange={formik.handleChange}
						>
							<option value="">Select a chart...</option>
							{chartData.map((e, i) => (
								<option key={i} value={e.chartID}>
									{e.name}
								</option>
							))}
						</Form.Select>
					) : (
						<Muted>Your search returned nothing... :(</Muted>
					)}
				</Form.Group>
			) : (
				<>
					<Form.Group>
						<Form.Label>Target</Form.Label>
						<FolderGTESelect
							value={gte}
							onChange={(e) => setGte(Number(e.target.value))}
							{...{
								game,
								playtype,
								metric: formik.values.metric,
							}}
						/>
					</Form.Group>
					<Form.Group>
						<Form.Label>Folder</Form.Label>
						<DebounceSearch setSearch={setFolderSearch} placeholder="Folder Name" />
						{folderData.length ? (
							<Form.Select
								id="folderID"
								value={formik.values.folderID}
								onChange={formik.handleChange}
								className="mt-4"
							>
								<option value="">Select a folder...</option>
								{folderData.map((e, i) => (
									<option key={i} value={e.folderID}>
										{e.name}
									</option>
								))}
							</Form.Select>
						) : (
							<></>
						)}
					</Form.Group>
				</>
			)}
			<Button
				disabled={formik.values.mode === "chart" && !formik.values.chartID}
				type="submit"
				className="mt-4"
			>
				Submit
			</Button>
		</Form>
	);
}

function FolderGTESelect({
	metric,
	game,
	playtype,
	value,
	onChange,
}: {
	metric: string;
	value: number;
	onChange: ChangeEventHandler<HTMLSelectElement | HTMLInputElement>;
} & GamePT) {
	const gptConfig = GetGamePTConfig(game, playtype);

	const props = { value, onChange };

	const conf = GetScoreMetricConf(gptConfig, metric);

	if (!conf) {
		return <>error: no conf? what?</>;
	}

	if (conf.type === "ENUM") {
		return (
			<select className="form-select" {...props}>
				{conf.values.map((e, i) => (
					<option key={i} value={i}>
						{e}
					</option>
				))}
			</select>
		);
	} else if (conf.type === "GRAPH" || conf.type === "NULLABLE_GRAPH") {
		return <>can't set stats for graphs. how'd you get here?</>;
	}

	return <input className="form-control" type="number" min={0} {...props} />;
}
