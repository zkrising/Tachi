import React from "react";
import { ChartDocument, PBScoreDocument, ScoreDocument } from "tachi-common";
import MillionsScoreCell from "../cells/MillionsScoreCell";
import SDVXJudgementCell from "../cells/SDVXJudgementCell";
import SDVXLampCell from "../cells/SDVXLampCell";
import VF6Cell from "../cells/VF6Cell";

export default function SDVXScoreCoreCells({
	sc,
	chart,
}: {
	sc: ScoreDocument<"sdvx:Single"> | PBScoreDocument<"sdvx:Single">;
	chart: ChartDocument<"sdvx:Single" | "usc:Controller" | "usc:Keyboard">;
}) {
	return (
		<>
			<MillionsScoreCell score={sc} />
			<SDVXJudgementCell score={sc} />
			<SDVXLampCell score={sc} />
			<VF6Cell score={sc} chart={chart} />
		</>
	);
}
