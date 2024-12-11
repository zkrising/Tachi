import SelectNav from "components/util/SelectNav";
import React, { useState } from "react";
import { Nav } from "react-bootstrap";
import { PBScoreDocument, ScoreData, ScoreDocument } from "tachi-common";
import OngekiScoreChart from "components/charts/OngekiScoreChart";

type ChartTypes = "Score" | "Bells" | "Life";

export function OngekiGraphsComponent({
	score,
}: {
	score: ScoreDocument<"ongeki:Single"> | PBScoreDocument<"ongeki:Single">;
}) {
	const [chart, setChart] = useState<ChartTypes>("Score");
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
					<SelectNav id="Score" value={chart} setValue={setChart} disabled={!available}>
						Score
					</SelectNav>
					<SelectNav id="Bells" value={chart} setValue={setChart} disabled={!available}>
						Bells
					</SelectNav>
					<SelectNav id="Life" value={chart} setValue={setChart} disabled={!available}>
						Life
					</SelectNav>
				</Nav>
			</div>
			<div className="col-12">
				{available ? (
					<GraphComponent type={chart} scoreData={score.scoreData} />
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
}: {
	type: ChartTypes;
	scoreData: ScoreData<"ongeki:Single">;
}) {
	const values =
		type === "Score"
			? scoreData.optional.scoreGraph!
			: type === "Bells"
			? scoreData.optional.bellGraph!
			: scoreData.optional.lifeGraph!;
	return (
		<OngekiScoreChart
			height="360px"
			mobileHeight="175px"
			type={type}
			data={[
				{
					id: type,
					data: values.map((e, i) => ({ x: i, y: e })),
				},
			]}
		/>
	);
}
