import { ResponsiveBar } from "@nivo/bar";
import { BarChartTooltip } from "components/charts/ChartTooltip";
import ClassBadge from "components/game/ClassBadge";
import useSetSubheader from "components/layout/header/useSetSubheader";
import Card from "components/layout/page/Card";
import ScoreTable from "components/tables/scores/ScoreTable";
import ApiError from "components/util/ApiError";
import AsyncLoader from "components/util/AsyncLoader";
import Divider from "components/util/Divider";
import Icon from "components/util/Icon";
import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import { TachiConfig } from "lib/config";
import React, { useEffect, useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
	ChartDocument,
	ClassAchievementDocument,
	FormatGame,
	gameClasses,
	GamePTConfig,
	GetGameConfig,
	GetGamePTConfig,
	integer,
	PublicUserDocument,
	ScoreDocument,
	SongDocument,
} from "tachi-common";
import { RecentClassesReturn } from "types/api-returns";
import { GamePT } from "types/react";
import { ScoreDataset } from "types/tables";
import { APIFetchV1 } from "util/api";
import { DEFAULT_BAR_PROPS } from "util/charts";
import { CreateChartMap, CreateSongMap, CreateUserMap } from "util/data";
import { UppercaseFirst } from "util/misc";
import { MillisToSince } from "util/time";

export default function GPTMainPage({ game, playtype }: GamePT) {
	useSetSubheader(
		["Games", GetGameConfig(game).name, playtype],
		[game, playtype],
		FormatGame(game, playtype)
	);

	const gptConfig = GetGamePTConfig(game, playtype);

	return (
		<>
			<Card header="Recent Highlighted Scores">
				<RecentHighlightedScoresComponent game={game} playtype={playtype} />
			</Card>
			{Object.keys(gptConfig.classHumanisedFormat).length !== 0 && (
				<>
					<Divider />
					<Card header="Recently Achieved Classes">
						<RecentClassesComponent game={game} playtype={playtype} />
					</Card>
					<Divider />
					<Card header="Class Distributions">
						<ClassDistributionComponent game={game} playtype={playtype} />
					</Card>
				</>
			)}
		</>
	);
}

function RecentHighlightedScoresComponent({ game, playtype }: GamePT) {
	const { data, isLoading, error } = useApiQuery<{
		scores: ScoreDocument[];
		users: PublicUserDocument[];
		charts: ChartDocument[];
		songs: SongDocument[];
	}>(`/games/${game}/${playtype}/scores/highlighted`);

	if (error) {
		return <ApiError error={error} />;
	}

	if (!data || isLoading) {
		return <Loading />;
	}

	const dataset: ScoreDataset = [];

	const songMap = CreateSongMap(data.songs);
	const chartMap = CreateChartMap(data.charts);
	const userMap = CreateUserMap(data.users);

	for (const [index, score] of data.scores.entries()) {
		dataset.push({
			...score,
			__related: {
				chart: chartMap.get(score.chartID)!,
				song: songMap.get(score.songID)!,
				index,
				user: userMap.get(score.userID)!,
			},
		});
	}

	return (
		<Row>
			<Col className="text-center" xs={12}>
				Here's what players have recently marked as highlighted scores!
			</Col>
			<Col xs={12}>
				<Divider />
			</Col>
			<Col xs={12}>
				<ScoreTable userCol dataset={dataset} game={game} playtype={playtype} />
			</Col>
		</Row>
	);
}

function RecentClassesComponent({ game, playtype }: GamePT) {
	const { data, isLoading, error } = useApiQuery<RecentClassesReturn>(
		`/games/${game}/${playtype}/recent-classes`
	);

	if (error) {
		return <ApiError error={error} />;
	}

	if (!data || isLoading) {
		return <Loading />;
	}

	// if (data.classes.length === 0) {
	// 	return <div className="text-center">Looks like nobodies got anything here... yet!</div>;
	// }

	const userMap = new Map<integer, PublicUserDocument>();

	for (const user of data.users) {
		userMap.set(user.id, user);
	}

	return (
		<div>
			{data.classes.length === 0 ? (
				<span>Looks like nobodies ever got a class for this game. Ah well.</span>
			) : (
				data.classes.map((c, i) => {
					const user = userMap.get(c.userID)!;

					return <AchievedClassRow key={i} classInfo={c} user={user} />;
				})
			)}
		</div>
	);
}

function AchievedClassRow({
	classInfo,
	user,
}: {
	classInfo: ClassAchievementDocument;
	user: PublicUserDocument;
}) {
	const game = classInfo.game;
	const playtype = classInfo.playtype;

	return (
		<div className="py-2 timeline-element">
			<Link to={`/dashboard/users/${user.username}/games/${game}/${playtype}`}>
				{user.username}
			</Link>{" "}
			achieved{" "}
			<ClassBadge
				classSet={classInfo.classSet}
				game={game}
				playtype={playtype}
				classValue={classInfo.classValue}
			/>
			{classInfo.classOldValue !== null && (
				<>
					{" "}
					(Raised from{" "}
					<ClassBadge
						classSet={classInfo.classSet}
						game={game}
						playtype={playtype}
						classValue={classInfo.classOldValue}
					/>
					)
				</>
			)}
			<span className="float-right d-none d-lg-inline">
				<Icon type="clock" />

				<span className="pl-1">{MillisToSince(classInfo.timeAchieved)}</span>
			</span>
		</div>
	);
}

function ClassDistributionComponent({ game, playtype }: GamePT) {
	const gptConfig = GetGamePTConfig(game, playtype);

	const [className, setClassName] = useState<gameClasses.AllClassSets>(
		Object.keys(gptConfig.classHumanisedFormat)[0] as gameClasses.AllClassSets
	);

	useEffect(() => {
		const gptConfig = GetGamePTConfig(game, playtype);
		setClassName(Object.keys(gptConfig.classHumanisedFormat)[0] as gameClasses.AllClassSets);
	}, [game, playtype]);

	return (
		<Row>
			<Col xs={12}>
				This will show the distribution of classes among all the players on{" "}
				{TachiConfig.name}!
			</Col>
			<Col xs={12}>
				<Divider />
			</Col>
			<Col xs={12} lg={4} className="offset-lg-4">
				<Form.Control
					as="select"
					value={className}
					onChange={e => setClassName(e.target.value as gameClasses.AllClassSets)}
				>
					{Object.keys(gptConfig.classHumanisedFormat).map(e => (
						<option value={e} key={e}>
							{UppercaseFirst(e)}
						</option>
					))}
				</Form.Control>
			</Col>
			<Col xs={12}>
				<Divider />
			</Col>
			<Col xs={12}>
				<AsyncLoader
					promiseFn={async () => {
						const res = await APIFetchV1<Record<string, integer>>(
							`/games/${game}/${playtype}/class-distribution?class=${className}`
						);

						if (!res.success) {
							throw new Error(res.description);
						}

						return res.body;
					}}
				>
					{d => <ClassDistChart data={d} gptConfig={gptConfig} className={className} />}
				</AsyncLoader>
			</Col>
		</Row>
	);
}

function ClassDistChart({
	data,
	gptConfig,
	className,
}: {
	data: Record<string, integer>;
	gptConfig: GamePTConfig;
	className: gameClasses.AllClassSets;
}) {
	const dataset = [];

	for (const key in gptConfig.classHumanisedFormat[className]) {
		dataset.push({
			id: key,
			count: data[key] ?? 0,
		});
	}

	if (dataset.length === 0) {
		return (
			<div style={{ height: 400 }}>
				<div className="d-flex justify-content-center align-items-center h-100">
					<span>Looks like nobody has any of these classes yet.</span>
				</div>
			</div>
		);
	}

	return (
		<div style={{ height: 200 + dataset.length * 10 }}>
			<ResponsiveBar
				data={dataset}
				keys={["count"]}
				indexBy="id"
				layout="horizontal"
				margin={{ left: 80, bottom: 40, top: 20, right: 20 }}
				colors={v => "#cc527a"}
				axisLeft={{
					format: v => gptConfig.classHumanisedFormat[className][v]?.display,
				}}
				tooltip={d => (
					<BarChartTooltip
						point={d}
						renderFn={d => (
							<div className="w-100 text-center">
								{
									gptConfig.classHumanisedFormat[className][
										d.indexValue as number
									].display
								}
								: {(d.data as any).count}
							</div>
						)}
					/>
				)}
				{...DEFAULT_BAR_PROPS}
			/>
		</div>
	);
}
