import { ResponsiveBar } from "@nivo/bar";
import { BarChartTooltip } from "components/charts/ChartTooltip";
import QuickTooltip from "components/layout/misc/QuickTooltip";
import Card from "components/layout/page/Card";
import FolderTable from "components/tables/folders/FolderTable";
import ApiError from "components/util/ApiError";
import Divider from "components/util/Divider";
import Icon from "components/util/Icon";
import Loading from "components/util/Loading";
import Muted from "components/util/Muted";
import useApiQuery from "components/util/query/useApiQuery";
import SelectButton from "components/util/SelectButton";
import { useFormik } from "formik";
import React, { useEffect, useMemo, useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import {
	ChartDocument,
	ChartTierlistInfo,
	FormatDifficulty,
	FormatDifficultyShort,
	Game,
	GetGamePTConfig,
	GPTTierlists,
	IDStrings,
	integer,
	PublicUserDocument,
	ScoreDocument,
	SongDocument,
} from "tachi-common";
import { UGPTFolderReturns } from "types/api-returns";
import { FolderDataset } from "types/tables";
import { Playtype } from "types/tachi";
import { DEFAULT_BAR_PROPS } from "util/charts";
import { ChangeOpacity } from "util/color-opacity";
import { ONE_DAY } from "util/constants/time";
import { CreateChartIDMap, CreateChartLink, CreateSongMap } from "util/data";
import { ComposeExpFn, ComposeInverseExpFn, IsNullish, NO_OP } from "util/misc";
import { GetGradeChartExpScale } from "util/scales";
import { NumericSOV, StrSOV } from "util/sorts";
import { GetScaleAchievedFn } from "util/tierlist";
import { FormatDate, FormatTime } from "util/time";

interface Props {
	reqUser: PublicUserDocument;
	game: Game;
	playtype: Playtype;
}

export default function SpecificFolderPage({ reqUser, game, playtype }: Props) {
	const { folderID } = useParams<{ folderID: string }>();

	const { data, isLoading, error } = useApiQuery<UGPTFolderReturns>(
		`/users/${reqUser.id}/games/${game}/${playtype}/folders/${folderID}`
	);

	const [mode, setMode] = useState<"normal" | "ladder" | "timeline">("normal");

	const gptConfig = GetGamePTConfig(game, playtype);

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

		folderDataset.sort(StrSOV(x => x.__related.song.title));

		return folderDataset;
	}, [data]);

	const folderInfoHeader = useMemo(() => {
		if (!folderDataset || !data) {
			return <Loading />;
		}

		return (
			<FolderInfoHeader
				folderDataset={folderDataset}
				data={data}
				game={game}
				playtype={playtype}
				reqUser={reqUser}
			/>
		);
	}, [folderDataset]);

	if (error) {
		return <ApiError error={error} />;
	}

	if (isLoading || !data || !folderDataset) {
		return <Loading />;
	}

	return (
		<div className="row">
			<div className="col-12">
				<Divider className="mb-4" />
			</div>
			<div className="col-12">{folderInfoHeader}</div>
			<div className="col-12">
				<Divider />
			</div>
			<div className="col-12 d-flex">
				<div className="btn-group mx-auto">
					<SelectButton value={mode} setValue={setMode} id="normal">
						<Icon type="table" />
						Normal View
					</SelectButton>
					{gptConfig.tierlists.length !== 0 && (
						<SelectButton value={mode} setValue={setMode} id="ladder">
							<Icon type="sort-alpha-up" />
							Tierlist View
						</SelectButton>
					)}
					<SelectButton value={mode} setValue={setMode} id="timeline">
						<Icon type="stream" />
						Timeline View
					</SelectButton>
				</div>
			</div>
			<div className="col-12">
				<Divider />
			</div>
			<div className="col-12">
				{mode === "normal" ? (
					<FolderTable
						dataset={folderDataset}
						game={game}
						playtype={playtype}
						reqUser={reqUser}
						indexCol={false}
					/>
				) : mode === "ladder" ? (
					<TierlistBreakdown
						folderDataset={folderDataset}
						game={game}
						playtype={playtype}
						reqUser={reqUser}
						data={data}
					/>
				) : (
					<TimelineView
						game={game}
						playtype={playtype}
						reqUser={reqUser}
						folderID={folderID}
					/>
				)}
			</div>
		</div>
	);
}

function TimelineView({ game, playtype, reqUser, folderID }: Props & { folderID: string }) {
	const gptConfig = GetGamePTConfig(game, playtype);
	const [type, setType] = useState<"lamp" | "grade">(gptConfig.scoreBucket);
	const [value, setValue] = useState<integer>(
		type === "grade" ? gptConfig.grades.length - 1 : gptConfig.lamps.length - 1
	);

	useEffect(() => {
		setValue(type === "grade" ? gptConfig.grades.length - 1 : gptConfig.lamps.length - 1);
	}, [type]);

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
							value={type}
							onChange={e => setType(e.target.value as "grade" | "lamp")}
						>
							<option value="grade">Grades</option>
							<option value="lamp">Lamps</option>
						</Form.Control>
					</div>
					<div className="col-12 col-lg-6">
						<Form.Control
							as="select"
							value={value}
							onChange={e => setValue(Number(e.target.value))}
						>
							{type === "grade"
								? gptConfig.grades.map((e, i) => (
										<option key={e} value={i}>
											{e}
										</option>
								  ))
								: gptConfig.lamps.map((e, i) => (
										<option key={e} value={i}>
											{e}
										</option>
								  ))}
						</Form.Control>
					</div>
				</div>
			</Card>
			<Divider />
			<TimelineMain {...{ reqUser, game, playtype, folderID, type, value }} />
		</>
	);
}

function TimelineMain({
	reqUser,
	game,
	playtype,
	folderID,
	type,
	value,
}: Props & {
	folderID: string;
	type: "grade" | "lamp";
	value: integer;
}) {
	const { data, isLoading, error } = useApiQuery<{
		scores: ScoreDocument[];
		songs: SongDocument[];
		charts: ChartDocument[];
	}>(
		`/users/${reqUser.id}/games/${game}/${playtype}/folders/${folderID}/timeline?criteriaValue=${value}&criteriaType=${type}`
	);

	if (error) {
		return <ApiError error={error} />;
	}

	if (isLoading || !data) {
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

	scoreDataset.sort(NumericSOV(x => x.timeAchieved ?? Infinity));

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
				<span className="mr-3" style={{ fontSize: "1.15rem" }}>
					<b>#{index}</b>:{" "}
					<Link
						to={CreateChartLink(scoreData.__related.chart, scoreData.game)}
						className="gentle-link"
					>
						{scoreData.__related.song.title}{" "}
						{FormatDifficulty(scoreData.__related.chart, scoreData.game)}
					</Link>
					{Date.now() - scoreData.timeAdded < ONE_DAY && (
						<span className="ml-2 label label-inline label-primary font-weight-bolder">
							NEW!
						</span>
					)}
				</span>
				<span className="text-muted font-italic text-right">
					{scoreData.timeAchieved === null
						? "Unknown Time"
						: FormatTime(scoreData.timeAchieved)}
				</span>
			</div>
		</div>
	);
}

type InfoProps = Props & {
	folderDataset: FolderDataset;
	data: UGPTFolderReturns;
};

function TierlistBreakdown({ game, folderDataset, playtype }: InfoProps) {
	const gptConfig = GetGamePTConfig(game, playtype);

	const formik = useFormik({
		initialValues: {
			__hideAchieved: false,
			...Object.fromEntries(gptConfig.tierlists.map(e => [e, true])),
		} as { __hideAchieved: boolean } & Partial<Record<GPTTierlists[IDStrings], true>>,
		onSubmit: NO_OP,
	});

	const tierlistInfo = FolderDatasetToTierlistInfo(folderDataset, game, playtype, formik.values);

	const dataMap = CreateChartIDMap(folderDataset);

	return (
		<Row>
			<Col xs={12}>
				<Card header="Tierlist View Configuration">
					<span>Here you can select what tierlist blocks to show!</span>
					<Divider />
					{gptConfig.tierlists.length > 1 &&
						gptConfig.tierlists.map(e => (
							<>
								<Form.Check
									key={e}
									type="checkbox"
									id={e}
									checked={formik.values[e]}
									onChange={formik.handleChange}
									label={e}
								/>
								<Form.Text>{gptConfig.tierlistDescriptions[e]}</Form.Text>
							</>
						))}

					<Form.Check
						type="checkbox"
						id="__hideAchieved"
						checked={formik.values.__hideAchieved}
						onChange={formik.handleChange}
						label="Hide Achieved"
					/>
					<Form.Text>Hide achieved elements of the tierlist.</Form.Text>
				</Card>
			</Col>
			<Col xs={12}>
				<Divider />
			</Col>
			<Col xs={12}>
				<TierlistInfoLadder
					tierlistInfo={tierlistInfo}
					dataMap={dataMap}
					game={game}
					playtype={playtype}
				/>
			</Col>
		</Row>
	);
}

function TierlistInfoLadder({
	tierlistInfo,
	dataMap,
	game,
	playtype,
}: {
	tierlistInfo: TierlistInfo[];
	dataMap: Map<string, FolderDataset[0]>;
	game: Game;
	playtype: Playtype;
}) {
	const buckets: TierlistInfo[][] = useMemo(() => {
		const buckets: TierlistInfo[][] = [];
		let currentBucket: TierlistInfo[] = [];

		let lastValue;
		for (const tl of tierlistInfo) {
			if (lastValue && tl.data.value !== lastValue) {
				buckets.push(currentBucket);
				currentBucket = [tl];
			} else {
				currentBucket.push(tl);
			}
			lastValue = tl.data.value;
		}

		if (currentBucket.length) {
			buckets.push(currentBucket);
		}

		return buckets;
	}, tierlistInfo);

	const gptConfig = GetGamePTConfig(game, playtype);

	for (const bucket of buckets) {
		bucket.sort(NumericSOV(x => gptConfig.tierlists.indexOf(x.key), true));
	}

	if (tierlistInfo.length === 0) {
		return <Row className="justify-content-center">Got no tierlist data to show you!</Row>;
	}

	return (
		<Row className="text-center">
			{buckets.map((bucket, i) => (
				<React.Fragment key={i}>
					<Col className="ladder-header" xs={12}>
						{bucket[0].data.value}
					</Col>

					{bucket.map((tierlistInfo, i) => {
						const data = dataMap.get(tierlistInfo.chartID)!;

						const lastKey = bucket[i - 1];

						let statusClass;

						switch (tierlistInfo.achieved) {
							case AchievedStatuses.ACHIEVED:
								statusClass = "achieved";
								break;
							case AchievedStatuses.FAILED:
								statusClass = "unachieved";
								break;
							case AchievedStatuses.NOT_PLAYED:
							case AchievedStatuses.SCORE_BASED:
								statusClass = "";
						}

						return (
							<>
								{lastKey && lastKey.key !== tierlistInfo.key && (
									<Col xl={12} className="my-2" />
								)}
								<Col
									className={`ladder-element ${
										i % 12 < 6 ? "ladder-element-dark" : ""
									} ladder-element-${statusClass}`}
									key={tierlistInfo.chartID}
									xs={6}
									sm={6}
									md={4}
									lg={3}
									xl={2}
								>
									<Link className="gentle-link" to={CreateChartLink(data, game)}>
										{data.__related.song.title}
									</Link>{" "}
									{FormatDifficultyShort(data, game)}
									<Divider className="my-2" />
									{tierlistInfo.key} ({tierlistInfo.data.text})
									{tierlistInfo.data.individualDifference && (
										<>
											<br />

											<div className="mt-1">
												<QuickTooltip tooltipContent="Individual Difference - The difficulty of this varies massively between people!">
													<span>
														<Icon type="balance-scale-left" />
													</span>
												</QuickTooltip>
											</div>
										</>
									)}
									<Divider className="my-2" />
									<Muted>
										{tierlistInfo.achieved === AchievedStatuses.NOT_PLAYED
											? "Not Played"
											: tierlistInfo.achieved === AchievedStatuses.SCORE_BASED
											? `You have: ${data.__related.pb!.scoreData.grade}`
											: `You have: ${data.__related.pb!.scoreData.lamp}`}
									</Muted>
								</Col>
							</>
						);
					})}
				</React.Fragment>
			))}
		</Row>
	);
}

interface TierlistInfo {
	chartID: string;
	key: GPTTierlists[IDStrings];
	data: ChartTierlistInfo;
	achieved: AchievedStatuses;
}

enum AchievedStatuses {
	NOT_PLAYED,
	FAILED,
	ACHIEVED,
	SCORE_BASED,
}

function FolderDatasetToTierlistInfo(
	folderDataset: FolderDataset,
	game: Game,
	playtype: Playtype,
	options: Partial<Record<GPTTierlists[IDStrings], boolean>> & { __hideAchieved: boolean }
) {
	const tierlistInfo: TierlistInfo[] = [];

	const tierlistKeys: GPTTierlists[IDStrings][] = [];

	for (const k in options) {
		const key = k as GPTTierlists[IDStrings];
		if (options[key]) {
			tierlistKeys.push(key);
		}
	}

	for (const data of folderDataset) {
		for (const key of tierlistKeys) {
			if (IsNullish(data.tierlistInfo[key])) {
				continue;
			}

			let achieved: AchievedStatuses;

			if (!data.__related.pb) {
				achieved = AchievedStatuses.NOT_PLAYED;
			} else {
				const fn = GetScaleAchievedFn(game, playtype, key);

				if (fn) {
					achieved = fn(data.__related.pb)
						? AchievedStatuses.ACHIEVED
						: AchievedStatuses.FAILED;
				} else {
					achieved = AchievedStatuses.SCORE_BASED;
				}
			}

			if (options.__hideAchieved && achieved === AchievedStatuses.ACHIEVED) {
				continue;
			}

			tierlistInfo.push({
				chartID: data.chartID,
				key,
				data: data.tierlistInfo[key]!,
				achieved,
			});
		}
	}

	return tierlistInfo.sort(NumericSOV(x => x.data.value, true));
}

function FolderInfoHeader({ game, playtype, reqUser, folderDataset, data }: InfoProps) {
	return (
		<Card header={`${reqUser.username}'s ${data.folder.title} Breakdown`}>
			<ScoreDistributionChart
				game={game}
				data={data}
				folderDataset={folderDataset}
				playtype={playtype}
				reqUser={reqUser}
			/>
		</Card>
	);
}

function ScoreDistributionChart({ game, playtype, folderDataset }: InfoProps) {
	const dataMap = CreateChartIDMap(folderDataset);
	const gptConfig = GetGamePTConfig(game, playtype);

	const dataset = [];

	const expScale = GetGradeChartExpScale(game);

	const expFn = ComposeExpFn(expScale);
	const invExpFn = ComposeInverseExpFn(expScale);

	for (const data of folderDataset) {
		const value = data.__related.pb ? expFn(data.__related.pb.scoreData.percent) : 0;
		dataset.push({
			chartID: data.chartID,
			expValue: expFn(value),
			value,
			grade: data.__related.pb?.scoreData.grade,
		});
	}

	dataset.sort(NumericSOV(x => x.expValue));

	return (
		<div style={{ height: 400 }}>
			<ResponsiveBar
				indexBy="chartID"
				tooltip={d => (
					<BarChartTooltip
						point={d}
						renderFn={d => {
							const data = dataMap.get(d.indexValue as string)!;

							return (
								<div className="w-100 text-center">
									{data.__related.song.title}
									<br />
									{data.__related.pb?.scoreData.percent.toFixed(2)}%
								</div>
							);
						}}
					/>
				)}
				key={"value"}
				colors={k => {
					if (!k.data.grade) {
						return "black";
					}
					// @ts-expect-error temp
					return ChangeOpacity(gptConfig.gradeColours[k.data.grade], 0.5);
				}}
				// @ts-expect-error temp
				borderColor={k => gptConfig.gradeColours[k.data.grade]}
				borderWidth={1}
				padding={0.2}
				// @ts-expect-error temp
				data={dataset}
				minValue={0}
				maxValue={expFn(100)}
				margin={{ left: 50, top: 20, bottom: 20 }}
				valueFormat={e => `${invExpFn(e).toFixed(2)}%`}
				axisLeft={{
					tickValues: gptConfig.gradeBoundaries.map(e => (e === 0 ? 0 : expFn(e))),
					format: x => {
						let nearest;

						const lgv = invExpFn(x);

						for (const [i, gradeBnd] of gptConfig.gradeBoundaries.entries()) {
							if (Math.abs(gradeBnd - lgv) < 0.00005) {
								nearest = i;
								break;
							}
						}

						if (nearest === undefined) {
							return null;
						}

						return gptConfig.grades[nearest];
					},
				}}
				axisBottom={null}
				{...DEFAULT_BAR_PROPS}
				labelSkipWidth={40}
			/>
		</div>
	);
}
