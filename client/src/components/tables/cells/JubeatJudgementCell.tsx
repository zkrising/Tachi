import React from "react";
import { COLOUR_SET, PBScoreDocument, ScoreDocument } from "tachi-common";
import { IsNullish } from "util/misc";

export default function JubeatJudgementCell({
	score,
}: {
	score: ScoreDocument<"jubeat:Single"> | PBScoreDocument<"jubeat:Single">;
}) {
	// even if we dont have judgement data, we know what they got.
	if (score.scoreData.lamp === "EXCELLENT") {
		return (
			<td>
				<strong>
					<span style={{ color: COLOUR_SET.pink }}>0</span>-
					<span style={{ color: COLOUR_SET.gold }}>0</span>-
					<span style={{ color: COLOUR_SET.blue }}>0</span>-
					<span style={{ color: COLOUR_SET.purple }}>0</span>-
					<span style={{ color: COLOUR_SET.red }}>0</span>
				</strong>
			</td>
		);
	}

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
