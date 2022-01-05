import React from "react";
import { PBScoreDocument, ScoreDocument } from "tachi-common";
import { IsNullish } from "util/misc";
import LampCell from "../cells/LampCell";
import MillionsScoreCell from "../cells/MillionsScoreCell";
import JubeatJudgementCell from "../cells/JubeatJudgementCell";

export default function JubeatCoreCells({
	sc,
}: {
	sc: ScoreDocument<"jubeat:Single"> | PBScoreDocument<"jubeat:Single">;
}) {
	return (
		<>
			<MillionsScoreCell score={sc} />
			<JubeatJudgementCell score={sc} />
			<LampCell score={sc} />
			<td>
				{!IsNullish(sc.calculatedData.jubility)
					? sc.calculatedData.jubility!.toFixed(2)
					: "N/A"}
			</td>
		</>
	);
}
