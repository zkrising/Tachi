import { IsNullish } from "util/misc";
import React from "react";
import { COLOUR_SET, PBScoreDocument, ScoreDocument } from "tachi-common";

export default function WaccaJudgementCell({
	score,
}: {
	score: ScoreDocument<"wacca:Single"> | PBScoreDocument<"wacca:Single">;
}) {
	const judgements = score.scoreData.judgements;

	if (
		IsNullish(judgements.miss) ||
		IsNullish(judgements.great) ||
		IsNullish(judgements.good) ||
		IsNullish(judgements.marvelous)
	) {
		return <td>No Data.</td>;
	}

	return (
		<td>
			<strong>
				<span style={{ color: COLOUR_SET.vibrantPink }}>{judgements.marvelous}</span>-
				<span style={{ color: COLOUR_SET.gold }}>{judgements.great}</span>-
				<span style={{ color: COLOUR_SET.blue }}>{judgements.good}</span>-
				<span style={{ color: COLOUR_SET.red }}>{judgements.miss}</span>
			</strong>
		</td>
	);
}
