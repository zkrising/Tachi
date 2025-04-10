import SelectNav from "components/util/SelectNav";
import React, { useState } from "react";
import { Nav } from "react-bootstrap";
import { ChartDocument, PBScoreDocument, ScoreData, ScoreDocument } from "tachi-common";
import OngekiScoreChart from "components/charts/OngekiScoreChart";

type ChartTypes = "Score" | "Platinum" | "Bells" | "Life";

export function OngekiGraphsComponent({
	score,
	chart,
}: {
	score: ScoreDocument<"ongeki:Single"> | PBScoreDocument<"ongeki:Single">;
	chart: ChartDocument<"ongeki:Single">;
}) {
	const [graph, setGraph] = useState<ChartTypes>("Score");
	const available =
		score.scoreData.optional.scoreGraph &&
		score.scoreData.optional.bellGraph &&
		score.scoreData.optional.lifeGraph &&
		score.scoreData.optional.totalBellCount !== null &&
		score.scoreData.optional.totalBellCount !== undefined;

	// Platinum graphs were added later so they need a separate check
	const availablePlat = score.scoreData.optional.platinumGraph;

	return (
		<>
			<div className="col-12 d-flex justify-content-center">
				<Nav variant="pills">
					<SelectNav id="Score" value={graph} setValue={setGraph} disabled={!available}>
						Score
					</SelectNav>
					<SelectNav
						id="Platinum"
						value={graph}
						setValue={setGraph}
						disabled={!availablePlat}
					>
						P-Score
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
					<GraphComponent type={graph} scoreData={score.scoreData} chart={chart} />
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
	chart,
}: {
	type: ChartTypes;
	scoreData: ScoreData<"ongeki:Single">;
	chart: ChartDocument<"ongeki:Single">;
}) {
	const values =
		type === "Score"
			? scoreData.optional.scoreGraph!
			: type === "Bells"
			? scoreData.optional.bellGraph!
			: type === "Life"
			? scoreData.optional.lifeGraph!
			: scoreData.optional.platinumGraph!;
	return (
		<OngekiScoreChart
			height="360px"
			mobileHeight="175px"
			type={type}
			maximumAbsoluteValue={
				type === "Bells" ? scoreData.optional.totalBellCount! : chart.data.maxPlatScore
			}
			difficulty={chart.difficulty}
			data={[
				{
					id: type,
					data: values.map((e, i) => ({ x: i, y: e })),
				},
			]}
		/>
	);
}
