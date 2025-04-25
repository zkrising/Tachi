import React from "react";
import {
	ChartDocument,
	Difficulties,
	PBScoreDocument,
	ScoreData,
	ScoreDocument,
} from "tachi-common";
import GekichuScoreChart from "components/charts/GekichuScoreChart";

export function ChunithmGraphsComponent({
	score,
	chart,
}: {
	score: ScoreDocument<"chunithm:Single"> | PBScoreDocument<"chunithm:Single">;
	chart: ChartDocument<"chunithm:Single">;
}) {
	const available = score.scoreData.optional.scoreGraph;

	return (
		<>
			<div className="col-12">
				{available ? (
					<GraphComponent scoreData={score.scoreData} difficulty={chart.difficulty} />
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
	scoreData,
	difficulty,
}: {
	scoreData: ScoreData<"chunithm:Single">;
	difficulty: Difficulties["chunithm:Single"];
}) {
	const values = scoreData.optional.scoreGraph!;
	return (
		<GekichuScoreChart
			height="360px"
			mobileHeight="175px"
			type="Score"
			difficulty={difficulty}
			data={[
				{
					id: "Score",
					data: values.map((e, i) => ({ x: i, y: e })),
				},
			]}
			game="chunithm"
		/>
	);
}
