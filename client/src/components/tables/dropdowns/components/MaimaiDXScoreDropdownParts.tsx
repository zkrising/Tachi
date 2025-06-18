import React, { useState } from "react";
import {
	ChartDocument,
	Difficulties,
	PBScoreDocument,
	ScoreData,
	ScoreDocument,
	SongDocument,
} from "tachi-common";
import GekichumaiScoreChart from "components/charts/GekichumaiScoreChart";
import SelectNav from "components/util/SelectNav";
import { Nav } from "react-bootstrap";
import useApiQuery from "components/util/query/useApiQuery";

type ChartType = "Score" | "Life";

export function MaimaiDXGraphsComponent({
	score,
	chart,
}: {
	score: ScoreDocument<"maimaidx:Single"> | PBScoreDocument<"maimaidx:Single">;
	chart: ChartDocument<"maimaidx:Single">;
}) {
	const [graph, setGraph] = useState<ChartType>("Score");
	const { percentGraph, lifeGraph } = score.scoreData.optional;

	if (!percentGraph && !lifeGraph) {
		return <Box message="No charts available" />;
	}

	const { data, error } = useApiQuery<{
		song: SongDocument<"maimaidx">;
	}>(`/games/maimaidx/Single/songs/${score.songID}`);

	if (error !== null || data === undefined) {
		return <Box message="Error retrieving chart" />;
	}

	if (!data.song.data.duration) {
		return <Box message="No charts available" />;
	}

	return (
		<>
			<div className="col-12 d-flex justify-content-center">
				<Nav variant="pills">
					{percentGraph && (
						<SelectNav id="Score" value={graph} setValue={setGraph}>
							Percent
						</SelectNav>
					)}
					{lifeGraph && (
						<SelectNav id="Life" value={graph} setValue={setGraph}>
							Life
						</SelectNav>
					)}
				</Nav>
			</div>
			<div className="col-12">
				<GraphComponent
					type={graph}
					song={data.song}
					scoreData={score.scoreData}
					difficulty={chart.difficulty}
				/>
			</div>
		</>
	);
}

function GraphComponent({
	scoreData,
	song,
	difficulty,
	type,
}: {
	scoreData: ScoreData<"maimaidx:Single">;
	song: SongDocument<"maimaidx">;
	difficulty: Difficulties["maimaidx:Single"];
	type: ChartType;
}) {
	const values =
		type === "Score" ? scoreData.optional.percentGraph! : scoreData.optional.lifeGraph!;
	return (
		<GekichumaiScoreChart
			height="360px"
			mobileHeight="175px"
			type={type}
			difficulty={difficulty}
			data={[
				{
					id: type,
					data: values.map((e, i) => ({ x: i, y: e })),
				},
			]}
			game="maimaidx"
			duration={song.data.duration!}
		/>
	);
}

function Box({ message }: { message: string }) {
	return (
		<div className="col-12">
			<div
				className="d-flex align-items-center justify-content-center"
				style={{ height: "200px" }}
			>
				<span className="text-body-secondary">{message}</span>
			</div>
		</div>
	);
}
