import React from "react";
import { PBScoreDocument, ScoreDocument } from "tachi-common";
import { IsNullish } from "util/misc";
import LampCell from "../cells/LampCell";
import MillionsScoreCell from "../cells/MillionsScoreCell";
import WaccaJudgementCell from "../cells/WACCAJudgementCell";

export default function WACCACoreCells({
	sc,
}: {
	sc: ScoreDocument<"wacca:Single"> | PBScoreDocument<"wacca:Single">;
}) {
	return (
		<div>
			<MillionsScoreCell score={sc} />
			<WaccaJudgementCell score={sc} />
			<LampCell score={sc} />
			<td>
				{!IsNullish(sc.calculatedData.rate) ? sc.calculatedData.rate!.toFixed(3) : "N/A"}
			</td>
		</div>
	);
}
