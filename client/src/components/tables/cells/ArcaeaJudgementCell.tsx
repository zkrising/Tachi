import { IsNullish } from "util/misc";
import React from "react";
import { COLOUR_SET, PBScoreDocument, ScoreDocument } from "tachi-common";

export default function ArcaeaJudgementCell({
	score,
}: {
	score: ScoreDocument<"arcaea:Single"> | PBScoreDocument<"arcaea:Single">;
}) {
	// even if we dont have judgement data, we know what they got.
	if (score.scoreData.lamp === "PURE MEMORY") {
		return (
			<td>
				<strong>
					<span style={{ color: COLOUR_SET.vibrantYellow }}>0</span>-
					<span style={{ color: COLOUR_SET.red }}>0</span>
				</strong>
			</td>
		);
	}

	const judgements = score.scoreData.judgements;

	if (IsNullish(judgements.far) || IsNullish(judgements.lost)) {
		return <td>No Data.</td>;
	}

	return (
		<td>
			<strong>
				<span style={{ color: COLOUR_SET.vibrantYellow }}>{judgements.far}</span>-
				<span style={{ color: COLOUR_SET.red }}>{judgements.lost}</span>
			</strong>
		</td>
	);
}
