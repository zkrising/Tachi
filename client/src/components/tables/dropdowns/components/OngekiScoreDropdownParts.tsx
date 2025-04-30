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

type ChartType = "Score" | "Bells" | "Life";

export function OngekiGraphsComponent({
	score,
	chart,
	song,
}: {
	score: ScoreDocument<"ongeki:Single"> | PBScoreDocument<"ongeki:Single">;
	chart: ChartDocument<"ongeki:Single">;
	song: SongDocument<"ongeki">;
}) {
	const [graph, setGraph] = useState<ChartType>("Score");
	const available =
		score.scoreData.optional.scoreGraph &&
		score.scoreData.optional.bellGraph &&
		score.scoreData.optional.lifeGraph &&
		score.scoreData.optional.totalBellCount !== null &&
		score.scoreData.optional.totalBellCount !== undefined;

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
				{available ? (
					<GraphComponent
						type={graph}
						scoreData={score.scoreData}
						song={song}
						difficulty={chart.difficulty}
					/>
				) : (
					<div
						className="d-flex align-items-center justify-content-center"
						style={{ height: "200px" }}
					>
						<span className="text-body-secondary">No charts available</span>
					</div>
				)}
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
