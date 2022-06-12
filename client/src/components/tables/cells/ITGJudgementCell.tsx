import { IsNullish } from "util/misc";
import React from "react";
import { COLOUR_SET, PBScoreDocument, ScoreDocument } from "tachi-common";

export default function ITGJudgementCell({
	score,
}: {
	score: ScoreDocument<"itg:Stamina"> | PBScoreDocument<"itg:Stamina">;
}) {
	const judgements = score.scoreData.judgements;

	if (
		IsNullish(judgements.fantastic) ||
		IsNullish(judgements.excellent) ||
		IsNullish(judgements.great) ||
		IsNullish(judgements.miss)
	) {
		return <td>No Data.</td>;
	}

	return (
		<td>
			<strong>
				<span style={{ color: COLOUR_SET.teal }}>{judgements.fantastic}</span>-
				<span style={{ color: COLOUR_SET.gold }}>{judgements.excellent}</span>-
				<span style={{ color: COLOUR_SET.green }}>{judgements.great}</span>-
				<span style={{ color: COLOUR_SET.purple }}>{judgements.decent ?? "N"}</span>-
				<span style={{ color: COLOUR_SET.orange }}>{judgements.wayoff ?? "N"}</span>-
				<span style={{ color: COLOUR_SET.red }}>{judgements.miss}</span>
			</strong>
		</td>
	);
}
