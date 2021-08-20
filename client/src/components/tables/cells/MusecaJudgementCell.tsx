import React from "react";
import { COLOUR_SET, PBScoreDocument, ScoreDocument } from "tachi-common";
import { IsNullish } from "util/misc";

export default function SDVXJudgementCell({
	score,
}: {
	score: ScoreDocument<"museca:Single"> | PBScoreDocument<"museca:Single">;
}) {
	// even if we dont have judgement data, we know what they got.
	if (score.scoreData.lamp === "PERFECT CONNECT ALL") {
		return (
			<td>
				<strong>
					<span style={{ color: COLOUR_SET.teal }}>0</span>-
					<span style={{ color: COLOUR_SET.red }}>0</span>
				</strong>
			</td>
		);
	}

	// safety
	if (score.scoreData.lamp === "CONNECT ALL") {
		score.scoreData.judgements.miss = 0;
	}

	const judgements = score.scoreData.judgements;

	if (IsNullish(judgements.miss) || IsNullish(judgements.near)) {
		return <td>No Data.</td>;
	}

	return (
		<td>
			<strong>
				<span style={{ color: COLOUR_SET.teal }}>{judgements.near}</span>-
				<span style={{ color: COLOUR_SET.red }}>{judgements.miss}</span>
			</strong>
		</td>
	);
}
