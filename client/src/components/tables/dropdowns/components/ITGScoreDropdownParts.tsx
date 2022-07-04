import ITGDensityChart from "components/charts/ITGDensityChart";
import SelectNav from "components/util/SelectNav";
import React, { useState } from "react";
import { Nav } from "react-bootstrap";
import { ChartDocument, PBScoreDocument, ScoreDocument } from "tachi-common";

export function ITGGraphsComponent({
	score,
	chart,
}: {
	score: ScoreDocument<"itg:Stamina"> | PBScoreDocument<"itg:Stamina">;
	chart: ChartDocument<"itg:Stamina">;
}) {
	const [graph, setGraph] = useState("DENSITY");

	return (
		<>
			<div className="col-12 d-flex justify-content-center">
				<Nav variant="pills">
					<SelectNav id="DENSITY" value={graph} setValue={setGraph}>
						Chart Density
					</SelectNav>
					<SelectNav id="HISTOGRAM" value={graph} setValue={setGraph} disabled>
						Judgement Histogram
					</SelectNav>
				</Nav>
			</div>
			<div className="col-12">
				{chart.data.breakdown.npsPerMeasure ? (
					<ITGDensityChart
						height="200px"
						mobileHeight="175px"
						data={[
							{
								id: "chart",
								data: chart.data.breakdown.npsPerMeasure.map((e, i) => ({
									x: i,
									y: e,
								})),
							},
						]}
					/>
				) : (
					<div
						className="d-flex align-items-center justify-content-center"
						style={{ height: "200px" }}
					>
						<span className="text-muted">No chart graph :(</span>
					</div>
				)}
			</div>
		</>
	);
}
