import React from "react";
import { COLOUR_SET, PBScoreDocument, ScoreDocument } from "tachi-common";
import { IsNullish } from "util/misc";

export default function PopnJudgementCell({
	score,
}: {
	score: ScoreDocument<"popn:9B"> | PBScoreDocument<"popn:9B">;
}) {
	const judgements = score.scoreData.judgements;

	if (IsNullish(judgements.bad) || IsNullish(judgements.great) || IsNullish(judgements.good)) {
		return <td>No Data.</td>;
	}

	return (
		<td>
			<strong>
				<span style={{ color: COLOUR_SET.vibrantYellow }}>{judgements.great}</span>-
				<span style={{ color: COLOUR_SET.red }}>{judgements.good}</span>
				<span style={{ color: COLOUR_SET.blue }}>{judgements.bad}</span>
			</strong>
		</td>
	);
}
