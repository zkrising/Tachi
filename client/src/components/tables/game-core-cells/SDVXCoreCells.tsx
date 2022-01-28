import React from "react";
import { ChartDocument, PBScoreDocument, ScoreDocument } from "tachi-common";
import { IsNullish } from "util/misc";
import LampCell from "../cells/LampCell";
import MillionsScoreCell from "../cells/MillionsScoreCell";
import SDVXJudgementCell from "../cells/SDVXJudgementCell";
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
			<LampCell score={sc} />
			<VF6Cell score={sc} chart={chart} />
			<td>{!IsNullish(sc.calculatedData.VF6) ? sc.calculatedData.VF6!.toFixed(3) : "N/A"}</td>
		</>
	);
}
