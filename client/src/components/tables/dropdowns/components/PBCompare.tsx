import React from "react";
import { ScoreDocument, PBScoreDocument, GPTString, ChartDocument } from "tachi-common";
import { UGPTChartPBComposition } from "types/api-returns";
import { ScoreState } from "../ScoreDropdown";

export default function PBCompare({
	data,
	scoreState,
	DocComponent,
}: {
	data: UGPTChartPBComposition;
	scoreState: ScoreState;
	DocComponent: (props: {
		score: ScoreDocument | PBScoreDocument;
		scoreState: ScoreState;
		pbData: UGPTChartPBComposition;
		forceScoreData: boolean;
		chart: ChartDocument;
	}) => JSX.Element;
}) {
	return (
		<DocComponent
			score={data.pb}
			pbData={data}
			scoreState={scoreState}
			forceScoreData
			chart={data.chart}
		/>
	);
}
