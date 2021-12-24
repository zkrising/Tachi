import React from "react";
import { COLOUR_SET, PBScoreDocument, ScoreDocument } from "tachi-common";
import { IsNullish } from "util/misc";

export default function WaccaJudgementCell({
	score,
}: {
	score: ScoreDocument<"wacca:Single"> | PBScoreDocument<"wacca:Single">;
}) {
	// even if we dont have judgement data, we know what they got.
	if (score.scoreData.lamp === "ALL MARVELOUS") {
		return (
			<td>
				<strong>
					<span style={{ color: COLOUR_SET.vibrantYellow }}>0</span>-
					<span style={{ color: COLOUR_SET.blue }}>0</span>-
					<span style={{ color: COLOUR_SET.red }}>0</span>
				</strong>
			</td>
		);
	}

	// safety
	if (score.scoreData.lamp === "FULL COMBO") {
		score.scoreData.judgements.miss = 0;
	}

	const judgements = score.scoreData.judgements;

	if (IsNullish(judgements.miss) || IsNullish(judgements.great) || IsNullish(judgements.good)) {
		return <td>No Data.</td>;
	}

	return (
		<td>
			<strong>
				<span style={{ color: COLOUR_SET.vibrantYellow }}>{judgements.great}</span>-
				<span style={{ color: COLOUR_SET.blue }}>{judgements.good}</span>
				<span style={{ color: COLOUR_SET.red }}>{judgements.miss}</span>
			</strong>
		</td>
	);
}
