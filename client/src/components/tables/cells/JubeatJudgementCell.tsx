import React from "react";
import { COLOUR_SET, PBScoreDocument, ScoreDocument } from "tachi-common";
import { IsNullish } from "util/misc";

export default function JubeatJudgementCell({
	score,
}: {
	score: ScoreDocument<"jubeat:Single"> | PBScoreDocument<"jubeat:Single">;
}) {
	const judgements = score.scoreData.judgements;

	if (
		IsNullish(judgements.miss) ||
		IsNullish(judgements.great) ||
		IsNullish(judgements.good) ||
		IsNullish(judgements.poor) ||
		IsNullish(judgements.perfect)
	) {
		return <td>No Data.</td>;
	}

	return (
		<td>
			<strong>
				<span style={{ color: COLOUR_SET.pink }}>{judgements.perfect}</span>-
				<span style={{ color: COLOUR_SET.gold }}>{judgements.great}</span>-
				<span style={{ color: COLOUR_SET.blue }}>{judgements.good}</span>-
				<span style={{ color: COLOUR_SET.purple }}>{judgements.poor}</span>-
				<span style={{ color: COLOUR_SET.red }}>{judgements.miss}</span>
			</strong>
		</td>
	);
}
