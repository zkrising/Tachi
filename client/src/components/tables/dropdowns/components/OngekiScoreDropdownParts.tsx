import SelectNav from "components/util/SelectNav";
import React, { useState } from "react";
import { Nav } from "react-bootstrap";
import {
	ChartDocument,
	Difficulties,
	PBScoreDocument,
	ScoreData,
	ScoreDocument,
	SongDocument,
} from "tachi-common";
import GekichuScoreChart from "components/charts/GekichuScoreChart";
import useApiQuery from "components/util/query/useApiQuery";

type ChartType = "Score" | "Bells" | "Life";

export function OngekiGraphsComponent({
	score,
	chart,
}: {
	score: ScoreDocument<"ongeki:Single"> | PBScoreDocument<"ongeki:Single">;
	chart: ChartDocument<"ongeki:Single">;
}) {
	const [graph, setGraph] = useState<ChartType>("Score");
	const available =
		score.scoreData.optional.scoreGraph &&
		score.scoreData.optional.bellGraph &&
		score.scoreData.optional.lifeGraph &&
		score.scoreData.optional.totalBellCount !== null &&
		score.scoreData.optional.totalBellCount !== undefined;

	if (!available) {
		return Box("No charts available");
	}

	const { data, error } = useApiQuery<{
		song: SongDocument<"ongeki">;
	}>(`/games/ongeki/Single/songs/${score.songID}`);
	if (error !== null || data === undefined) {
		return Box("Error retrieving chart");
	}
	const song = data.song;

	return (
		<>
			<div className="col-12 d-flex justify-content-center">
				<Nav variant="pills">
					<SelectNav id="Score" value={graph} setValue={setGraph} disabled={!available}>
						Score
					</SelectNav>
					<SelectNav id="Bells" value={graph} setValue={setGraph} disabled={!available}>
						Bells
					</SelectNav>
					<SelectNav id="Life" value={graph} setValue={setGraph} disabled={!available}>
						Life
					</SelectNav>
				</Nav>
			</div>
			<div className="col-12">
				<GraphComponent
					type={graph}
					scoreData={score.scoreData}
					song={song}
					difficulty={chart.difficulty}
				/>
			</div>
		</>
	);
}

function GraphComponent({
	type,
	scoreData,
	song,
	difficulty,
}: {
	type: ChartType;
	scoreData: ScoreData<"ongeki:Single">;
	song: SongDocument<"ongeki">;
	difficulty: Difficulties["ongeki:Single"];
}) {
	const values =
		type === "Score"
			? scoreData.optional.scoreGraph!
			: type === "Bells"
			? scoreData.optional.bellGraph!
			: scoreData.optional.lifeGraph!;
	return (
		<GekichuScoreChart
			height="360px"
			mobileHeight="175px"
			type={type}
			totalBellCount={scoreData.optional.totalBellCount!}
			difficulty={difficulty}
			data={[
				{
					id: type,
					data: values.map((e, i) => ({ x: i, y: e })),
				},
			]}
			game="ongeki"
			duration={song.data.duration}
		/>
	);
}

function Box(message: string) {
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
