import React, { useState } from "react";
import {
	ChartDocument,
	Difficulties,
	PBScoreDocument,
	ScoreData,
	ScoreDocument,
} from "tachi-common";
import GekichuScoreChart from "components/charts/GekichuScoreChart";
import SelectNav from "components/util/SelectNav";
import { Nav } from "react-bootstrap";

type ChartTypes = "Score" | "Life";

export function ChunithmGraphsComponent({
	score,
	chart,
}: {
	score: ScoreDocument<"chunithm:Single"> | PBScoreDocument<"chunithm:Single">;
	chart: ChartDocument<"chunithm:Single">;
}) {
	const [graph, setGraph] = useState<ChartTypes>("Score");
	const available = score.scoreData.optional.scoreGraph && score.scoreData.optional.lifeGraph;

	return (
		<>
			<div className="col-12 d-flex justify-content-center">
				<Nav variant="pills">
					<SelectNav id="Score" value={graph} setValue={setGraph} disabled={!available}>
						Score
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
	scoreData,
	difficulty,
	type,
}: {
	scoreData: ScoreData<"chunithm:Single">;
	difficulty: Difficulties["chunithm:Single"];
	type: ChartTypes;
}) {
	const values =
		type === "Score" ? scoreData.optional.scoreGraph! : scoreData.optional.lifeGraph!;
	return (
		<GekichuScoreChart
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
			game="chunithm"
		/>
	);
}
