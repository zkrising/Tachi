import { ONE_DAY } from "util/constants/time";
import { CreateChartIDMap, CreateSongMap } from "util/data";
import { UppercaseFirst } from "util/misc";
import { NumericSOV, StrSOV } from "util/sorts";
import { FormatDate } from "util/time";
import FolderInfoHeader from "components/game/folder/FolderInfoHeader";
import Card from "components/layout/page/Card";
import DifficultyCell from "components/tables/cells/DifficultyCell";
import TimestampCell from "components/tables/cells/TimestampCell";
import TitleCell from "components/tables/cells/TitleCell";
import MiniTable from "components/tables/components/MiniTable";
import FolderTable from "components/tables/folders/FolderTable";
import ScoreCoreCells from "components/tables/game-core-cells/ScoreCoreCells";
import ApiError from "components/util/ApiError";
import Divider from "components/util/Divider";
import Icon from "components/util/Icon";
import Loading from "components/util/Loading";
import SelectLinkButton from "components/util/SelectLinkButton";
import useApiQuery from "components/util/query/useApiQuery";
import useUGPTBase from "components/util/useUGPTBase";
import React, { useEffect, useMemo, useState } from "react";
import { Form } from "react-bootstrap";
import { Route, Switch, useParams } from "react-router-dom";
import {
	ChartDocument,
	Game,
	GetGamePTConfig,
	GetScoreEnumConfs,
	Playtype,
	ScoreDocument,
	SongDocument,
	UserDocument,
	integer,
} from "tachi-common";
import { ConfEnumScoreMetric } from "tachi-common/types/metrics";
import { UGPTFolderReturns } from "types/api-returns";
import { FolderDataset } from "types/tables";
import FolderComparePage from "./FolderComparePage";
import FolderQuestsPage from "./FolderQuestsPage";

interface Props {
	reqUser: UserDocument;
	game: Game;
	playtype: Playtype;
}

export default function SpecificFolderPage({ reqUser, game, playtype }: Props) {
	const { folderID } = useParams<{ folderID: string }>();

	const { data, error } = useApiQuery<UGPTFolderReturns>(
		`/users/${reqUser.id}/games/${game}/${playtype}/folders/${folderID}`
	);

	const folderDataset = useMemo(() => {
		if (!data) {
			return null;
		}

		const songMap = CreateSongMap(data.songs);
		const pbMap = CreateChartIDMap(data.pbs);

		const folderDataset: FolderDataset = [];

		for (const chart of data.charts) {
			folderDataset.push({
				...chart,
				__related: {
					pb: pbMap.get(chart.chartID) ?? null,
					song: songMap.get(chart.songID)!,
					user: reqUser,
				},
			});
		}

		folderDataset.sort(StrSOV((x) => x.__related.song.title));

		return folderDataset;
	}, [data]);

	const folderInfoHeader = useMemo(() => {
		if (!folderDataset || !data) {
			return <Loading />;
		}

		return (
			<FolderInfoHeader
				folderDataset={folderDataset}
				folderTitle={data.folder.title}
				game={game}
				playtype={playtype}
				reqUser={reqUser}
			/>
		);
	}, [folderDataset]);

	const base = `${useUGPTBase({ reqUser, game, playtype })}/folders/${folderID}`;

	if (error) {
		return <ApiError error={error} />;
	}

	if (!data || !folderDataset) {
		return <Loading />;
	}

	return (
		<div className="row">
			<div className="col-12">{folderInfoHeader}</div>
			<div className="col-12">
				<Divider />
			</div>
			<div className="col-12 d-flex">
				<div className="btn-group d-flex w-100">
					<SelectLinkButton to={base}>
						<Icon type="table" />
						Normal View
					</SelectLinkButton>
					<SelectLinkButton to={`${base}/timeline`}>
						<Icon type="stream" />
						Timeline View
					</SelectLinkButton>
					<SelectLinkButton to={`${base}/compare`}>
						<Icon type="users" />
						Compare Against User
					</SelectLinkButton>
					<SelectLinkButton to={`${base}/targets`}>
						<Icon type="scroll" />
						Goals & Quests
					</SelectLinkButton>
				</div>
			</div>
			<div className="col-12">
				<Divider />
			</div>
			<div className="col-12">
				<Switch>
					<Route exact path={base}>
						<FolderTable dataset={folderDataset} game={game} playtype={playtype} />
					</Route>
					<Route exact path={`${base}/timeline`}>
						<TimelineView
							game={game}
							playtype={playtype}
							reqUser={reqUser}
							folderID={folderID}
						/>
					</Route>
					<Route exact path={`${base}/compare`}>
						<FolderComparePage
							game={game}
							playtype={playtype}
							reqUser={reqUser}
							folder={data.folder}
						/>
					</Route>
					<Route exact path={`${base}/targets`}>
						<FolderQuestsPage
							game={game}
							playtype={playtype}
							reqUser={reqUser}
							folder={data.folder}
						/>
					</Route>
				</Switch>
			</div>
		</div>
	);
}

function TimelineView({ game, playtype, reqUser, folderID }: Props & { folderID: string }) {
	const gptConfig = GetGamePTConfig(game, playtype);
	const enumConfs = GetScoreEnumConfs(gptConfig);

	const [selectedEnum, setSelectedEnum] = useState<string>(gptConfig.preferredDefaultEnum);
	const [enumConf, setEnumConf] = useState<ConfEnumScoreMetric<string>>(enumConfs[selectedEnum]!);

	const [value, setValue] = useState<string>(enumConf.minimumRelevantValue);

	useEffect(() => {
		setValue(enumConfs[selectedEnum]!.minimumRelevantValue);
		setEnumConf(enumConfs[selectedEnum]!);
	}, [selectedEnum]);

	return (
		<>
			<Card header="Timeline View">
				<div className="row">
					<div className="col-12">
						<h5 className="text-center">
							The timeline view shows the order in which you achieved something in a
							folder! You can choose the criteria up here.
						</h5>
						<Divider />
					</div>
					<div className="col-12 col-lg-6">
						<Form.Control
							as="select"
							value={selectedEnum}
							onChange={(e) => setSelectedEnum(e.target.value)}
						>
							{Object.keys(enumConfs).map((e) => (
								<option key={e} value={e}>
									{UppercaseFirst(e)}
								</option>
							))}
						</Form.Control>
					</div>
					<div className="col-12 col-lg-6">
						<Form.Control
							as="select"
							value={value}
							onChange={(e) => setValue(e.target.value)}
						>
							{enumConf.values
								.slice(enumConf.values.indexOf(enumConf.minimumRelevantValue))
								.map((e) => (
									<option key={e}>{e}</option>
								))}
						</Form.Control>
					</div>
				</div>
			</Card>
			<Divider />
			<TimelineMain
				{...{ reqUser, game, playtype, folderID, enumMetric: selectedEnum, value }}
			/>
		</>
	);
}

function TimelineMain({
	reqUser,
	game,
	playtype,
	folderID,
	enumMetric: enumMetric,
	value,
}: Props & {
	folderID: string;
	enumMetric: string;
	value: string;
}) {
	const { data, error } = useApiQuery<{
		scores: ScoreDocument[];
		songs: SongDocument[];
		charts: ChartDocument[];
	}>(
		`/users/${reqUser.id}/games/${game}/${playtype}/folders/${folderID}/timeline?criteriaValue=${value}&criteriaType=${enumMetric}`
	);

	if (error) {
		return <ApiError error={error} />;
	}

	if (!data) {
		return <Loading />;
	}

	const scoreDataset = [];

	const songMap = CreateSongMap(data.songs);
	const chartMap = CreateChartIDMap(data.charts);

	for (const score of data.scores) {
		scoreDataset.push({
			...score,
			__related: {
				song: songMap.get(score.songID)!,
				chart: chartMap.get(score.chartID)!,
			},
		});
	}

	scoreDataset.sort(NumericSOV((x) => x.timeAchieved ?? Infinity));

	const elements = [];

	let lastDay = 0;
	let index = 1;
	let hasHitNulls = false;

	for (const scoreData of scoreDataset) {
		if (scoreData.timeAchieved !== null) {
			// Insane hack to floor a date to the beginning of that
			// day.
			const dayNum = new Date(scoreData.timeAchieved).setHours(0, 0, 0, 0);

			if (!lastDay || lastDay !== dayNum) {
				lastDay = dayNum;
				elements.push(
					<TimelineDivider>{FormatDate(scoreData.timeAchieved)}</TimelineDivider>
				);
			}
		} else if (!hasHitNulls) {
			elements.push(<TimelineDivider>Unknown Time</TimelineDivider>);
			hasHitNulls = true;
		}

		elements.push(
			<TimelineElement index={index} scoreData={scoreData} key={scoreData.scoreID} />
		);
		index++;
	}

	return (
		<>
			<div className="text-center">
				<h1 className="display-4">Total Progress</h1>
				<h1 className="display-4">
					{data.scores.length}
					<span className="text-muted" style={{ fontSize: "1.1rem" }}>
						/{data.charts.length}
					</span>
				</h1>
			</div>
			<Divider />
			<div className="timeline timeline-2">
				<div className="timeline-bar"></div>
				{elements}
			</div>
			<Divider />
			<div className="text-center">
				<h1 className="display-4">Total Progress</h1>
				<h1 className="display-4">
					{data.scores.length}
					<span className="text-muted" style={{ fontSize: "1.1rem" }}>
						/{data.charts.length}
					</span>
				</h1>
			</div>
		</>
	);
}

function TimelineDivider({ children }: { children: string }) {
	return (
		<div className="w-100 text-center my-4">
			<h4>{children}</h4>
		</div>
	);
}

function TimelineElement({
	scoreData,
	index,
}: {
	index: integer;
	scoreData: ScoreDocument & {
		__related: {
			song: SongDocument;
			chart: ChartDocument;
		};
	};
}) {
	return (
		<div className="timeline-item">
			<span className="timeline-badge bg-primary"></span>
			<div className="timeline-content d-flex align-items-center justify-content-between">
				<span className="mr-3 w-100" style={{ fontSize: "1.15rem" }}>
					<MiniTable>
						<td>
							<b>#{index}</b>
							{Date.now() - scoreData.timeAdded < ONE_DAY && (
								<span className="ml-2 label label-inline label-primary font-weight-bolder">
									NEW!
								</span>
							)}
						</td>
						<DifficultyCell
							alwaysShort
							game={scoreData.game}
							chart={scoreData.__related.chart}
						/>
						<TitleCell
							game={scoreData.game}
							chart={scoreData.__related.chart}
							song={scoreData.__related.song}
						/>
						<ScoreCoreCells
							game={scoreData.game}
							chart={scoreData.__related.chart}
							score={scoreData}
						/>
						<TimestampCell time={scoreData.timeAchieved} />
					</MiniTable>
				</span>
			</div>
		</div>
	);
}
