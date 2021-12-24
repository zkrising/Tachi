import React from "react";
import { PBScoreDocument, ScoreDocument } from "tachi-common";
import { IsNullish } from "util/misc";
import LampCell from "../cells/LampCell";
import MillionsScoreCell from "../cells/MillionsScoreCell";
import PopnJudgementCell from "../cells/PopnJudgementCell";
import WaccaJudgementCell from "../cells/WACCAJudgementCell";

export default function PopnCoreCells({
	sc,
}: {
	sc: ScoreDocument<"popn:9B"> | PBScoreDocument<"popn:9B">;
}) {
	return (
		<>
			<MillionsScoreCell score={sc} />
			<PopnJudgementCell score={sc} />
			<LampCell score={sc} />
			<td>
				{!IsNullish(sc.calculatedData.classPoints)
					? sc.calculatedData.classPoints!.toFixed(3)
					: "N/A"}
			</td>
		</>
	);
}
