import { IsNullish } from "util/misc";
import React from "react";
import { COLOUR_SET, PBScoreDocument, ScoreDocument } from "tachi-common";

export default function MaimaiJudgementCell({
	score,
}: {
	score: ScoreDocument<"maimai:Single"> | PBScoreDocument<"maimai:Single">;
}) {
	const judgements = score.scoreData.judgements;

	if (
		IsNullish(judgements.miss) ||
		IsNullish(judgements.great) ||
		IsNullish(judgements.good) ||
		IsNullish(judgements.perfect)
	) {
		return <td>No Data.</td>;
	}

	return (
		<td>
			<strong>
				<span style={{ color: COLOUR_SET.vibrantYellow }}>{judgements.perfect}</span>-
				<span style={{ color: COLOUR_SET.pink }}>{judgements.great}</span>-
				<span style={{ color: COLOUR_SET.green }}>{judgements.good}</span>-
				<span style={{ color: COLOUR_SET.gray }}>{judgements.miss}</span>
			</strong>
		</td>
	);
}
