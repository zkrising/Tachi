import React from "react";
import { ScoreDocument } from "tachi-common";
import { IsNullish } from "util/misc";
import LampCell from "../cells/LampCell";
import MillionsScoreCell from "../cells/MillionsScoreCell";
import SDVXJudgementCell from "../cells/SDVXJudgementCell";

export default function SDVXScoreCoreCells({ sc }: { sc: ScoreDocument<"sdvx:Single"> }) {
	return (
		<>
			<MillionsScoreCell score={sc} />
			<SDVXJudgementCell score={sc} />
			<LampCell score={sc} />
			<td>{!IsNullish(sc.calculatedData.VF6) ? sc.calculatedData.VF6!.toFixed(3) : "N/A"}</td>
		</>
	);
}
