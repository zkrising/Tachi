import React from "react";
import { ChartDocument, PBScoreDocument, ScoreDocument } from "tachi-common";
import { GetEnumColour } from "lib/game-implementations";
import MillionsScoreCell from "../cells/MillionsScoreCell";
import SDVXJudgementCell from "../cells/SDVXJudgementCell";
import SDVXLampCell from "../cells/SDVXLampCell";
import VF6Cell from "../cells/VF6Cell";

export default function SDVXScoreCoreCells({
	sc,
	chart,
	short,
}: {
	sc: ScoreDocument<"sdvx:Single"> | PBScoreDocument<"sdvx:Single">;
	chart: ChartDocument<"sdvx:Single" | "usc:Controller" | "usc:Keyboard">;
	short: boolean;
}) {
	return (
		<>
			<MillionsScoreCell
				score={sc.scoreData.score}
				grade={sc.scoreData.grade}
				colour={GetEnumColour(sc, "grade")}
			/>
			<SDVXJudgementCell score={sc} />
			<SDVXLampCell score={sc} />
			{!short && <VF6Cell score={sc} chart={chart} />}
		</>
	);
}
