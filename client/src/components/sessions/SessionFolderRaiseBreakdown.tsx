import { ChangeOpacity } from "util/color-opacity";
import { CreateChartLink, CreateChartMap, CreateSongMap } from "util/data";
import { NumericSOV, StrSOV } from "util/sorts";
import { APIFetchV1 } from "util/api";
import { JoinJSX } from "util/misc";
import Card from "components/layout/page/Card";
import DifficultyCell from "components/tables/cells/DifficultyCell";
import TitleCell from "components/tables/cells/TitleCell";
import MiniTable from "components/tables/components/MiniTable";
import ApiError from "components/util/ApiError";
import Divider from "components/util/Divider";
import Loading from "components/util/Loading";
import Muted from "components/util/Muted";
import useApiQuery from "components/util/query/useApiQuery";
import useLUGPTSettings from "components/util/useLUGPTSettings";
import _ from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
	ChartDocument,
	FormatChart,
	FormatGame,
	Game,
	GamePTConfig,
	GetGamePTConfig,
	integer,
	SongDocument,
	TableDocument,
} from "tachi-common";
import { SessionFolderRaises, SessionReturns } from "types/api-returns";
import DropdownRow from "components/tables/components/DropdownRow";
import DropdownIndicatorCell from "components/tables/cells/DropdownIndicatorCell";

export default function SessionFolderRaiseBreakdown({
	sessionData,
}: {
	sessionData: SessionReturns;
}) {
	const reqUser = sessionData.user;
	const { settings } = useLUGPTSettings();

	const game = sessionData.session.game;
	const playtype = sessionData.session.playtype;
	const gptConfig = GetGamePTConfig(game, playtype);

	const [folderFilter, setFolderFilter] = useState<"LOADING" | "NO_FILTER" | Array<string>>(
		"LOADING"
	);

	useEffect(() => {
		// this game probably has multiple tables that should be filtered
		// tables in a game like IIDX are redundant to show together: nobody
		// cares that they got +5 in omnimix and +5 in non-omnimix and +5 in n-0.
		// but in BMS, cross table playing is very common.
		// as such, we try and guess whether tables are significant or not
		// dependent on how many supported versions this game has.
		if (gptConfig.orderedSupportedVersions.length > 1) {
			APIFetchV1<Array<TableDocument>>(`/games/${game}/${playtype}/tables`).then((res) => {
				if (!res.success) {
					console.error(
						`Failed to fetch folders for ${FormatGame(
							game,
							playtype
						)}. Defaulting to hiding all folders.`
					);
					return setFolderFilter([]);
				}

				if (settings?.preferences.defaultTable) {
					const preferredTable = res.body.find(
						(e) => e.tableID === settings.preferences.defaultTable
					);

					if (!preferredTable) {
						// user has an invalid preferred table. silently ignore this.
					} else {
						return setFolderFilter(preferredTable.folders);
					}
				}

				const defaultTable = res.body.find((e) => e.default);

				if (!defaultTable) {
					console.error(
						`Found no default table for ${FormatGame(
							game,
							playtype
						)}? Defaulting to hiding all folders.`
					);
					// no default table? What?
					// filter out all folders, i guess.
					return setFolderFilter([]);
				}

				setFolderFilter(defaultTable.folders);
			});
		} else {
			setFolderFilter("NO_FILTER");
		}
	}, [gptConfig, settings]);

	const { data, error } = useApiQuery<Array<SessionFolderRaises>>(
		`/sessions/${sessionData.session.sessionID}/folder-raises`
	);

	const folders = useMemo(() => {
		if (!data) {
			return [];
		}

		// get all unique folders
		let folders = _.uniqBy(
			data.map((e) => e.folder),
			(x) => x.folderID
		);

		// sort alphabetically
		folders.sort(StrSOV((x) => x.title));

		// hide certain folders
		if (Array.isArray(folderFilter)) {
			folders = folders.filter((e) => folderFilter.includes(e.folderID));
		}

		return folders;
	}, [data, folderFilter]);

	if (error) {
		return <ApiError error={error} />;
	}

	if (!data) {
		return <Loading />;
	}

	const chartMap = CreateChartMap(sessionData.charts);
	const songMap = CreateSongMap(sessionData.songs);

	const preferredScoreBucket = settings?.preferences.scoreBucket ?? gptConfig.scoreBucket;

	if (folderFilter === "LOADING") {
		return <Loading />;
	}

	return (
		<Col xs={12}>
			<Divider />

			<h1 className="w-100 text-center">Folder Raises</h1>

			<Row>
				{folders.map((folder, i) => (
					<Col key={i} xs={12} lg={6} xl={4}>
						<Card
							className="my-4"
							header={
								<h3 className="text-center w-100">
									<Link
										className="gentle-link"
										to={`/dashboard/users/${reqUser.username}/games/${game}/${playtype}/folders/${folder.folderID}`}
									>
										{folder.title}
									</Link>
								</h3>
							}
						>
							<MiniTable headers={["New Grades/Lamps"]} colSpan={100}>
								{data
									.filter((e) => e.folder.folderID === folder.folderID)
									.sort(SortRaisesNicely(gptConfig, preferredScoreBucket))
									.map((folderRaiseInfo, i) => (
										<FolderRaiseRender
											key={i}
											songMap={songMap}
											chartMap={chartMap}
											game={game}
											folderRaiseInfo={folderRaiseInfo}
											gptConfig={gptConfig}
										/>
									))}
							</MiniTable>
						</Card>
					</Col>
				))}
			</Row>
		</Col>
	);
}

const SortRaisesNicely = (gptConfig: GamePTConfig, preferredScoreBucket: "grade" | "lamp") =>
	NumericSOV<SessionFolderRaises>((x) => {
		const baseValue =
			x.type === "grade"
				? gptConfig.grades.indexOf(x.value)
				: gptConfig.lamps.indexOf(x.value);

		// if this is what the user prefers to see, push it to the top
		if (x.type === preferredScoreBucket) {
			return baseValue + 1_000_000;
		}

		return baseValue;
	}, true);

function FolderRaiseRender({
	folderRaiseInfo,
	game,
	songMap,
	chartMap,
	gptConfig,
}: {
	folderRaiseInfo: SessionFolderRaises;
	chartMap: Map<string, ChartDocument>;
	songMap: Map<integer, SongDocument>;
	game: Game;
	gptConfig: GamePTConfig;
}) {
	let colour;

	if (folderRaiseInfo.type === "grade") {
		colour = gptConfig.gradeColours[folderRaiseInfo.value];
	} else {
		colour = gptConfig.lampColours[folderRaiseInfo.value];
	}

	const newTotal = folderRaiseInfo.previousCount + folderRaiseInfo.raisedCharts.length;

	return (
		<DropdownRow
			dropdown={
				<div style={{ padding: "unset" }}>
					<ChartRaises
						chartMap={chartMap}
						game={game}
						songMap={songMap}
						raisedCharts={folderRaiseInfo.raisedCharts}
					/>
				</div>
			}
		>
			<td
				style={{
					backgroundColor: ChangeOpacity(colour, 0.2),
				}}
			>
				{folderRaiseInfo.value}
			</td>
			<td>
				<div>
					<Muted>{folderRaiseInfo.previousCount}</Muted>
					<span className="px-4">⟶</span>
					<strong style={{ fontSize: "1.25rem" }}>{newTotal}</strong>
					<Muted>/{folderRaiseInfo.totalCharts}</Muted>
				</div>
				{folderRaiseInfo.totalCharts - newTotal < 10 && (
					<div className="w-100 mt-1 text-warning">
						{folderRaiseInfo.totalCharts - newTotal} to go!
					</div>
				)}
			</td>
			<td>
				<span
					className="text-success"
					style={{
						fontSize: folderRaiseInfo.raisedCharts.length > 5 ? "1.25rem" : "1rem",
					}}
				>
					+{folderRaiseInfo.raisedCharts.length}
				</span>
			</td>
			<DropdownIndicatorCell />
		</DropdownRow>
	);
}

function ChartRaises({
	chartMap,
	songMap,
	game,
	raisedCharts,
}: {
	raisedCharts: Array<string>;
	chartMap: Map<string, ChartDocument>;
	songMap: Map<integer, SongDocument>;
	game: Game;
}) {
	const els = [];

	for (const chartID of raisedCharts) {
		const chart = chartMap.get(chartID);

		if (!chart) {
			console.warn(`No chart '${chartID}' exists? continuing.`);
			continue;
		}
		const song = songMap.get(chart.songID);

		if (!song) {
			console.warn(`No song '${chart.songID}' exists, but the chart does?`);
			continue;
		}

		els.push(
			<span>
				<Link className="text-success" to={CreateChartLink(chart, game)}>
					+ {FormatChart(game, song, chart, true)}
				</Link>
			</span>
		);
	}

	return (
		<div className="my-2" style={{ textAlign: "left", paddingLeft: "1rem" }}>
			{JoinJSX(els, <br />)}
		</div>
	);
}
