import { IsNullish } from "util/misc";
import React from "react";
import { COLOUR_SET, PBScoreDocument, ScoreDocument } from "tachi-common";

export default function OngekiJudgementCell({
	score,
}: {
	score: ScoreDocument<"ongeki:Single"> | PBScoreDocument<"ongeki:Single">;
}) {
	const judgements = score.scoreData.judgements;

	if (
		IsNullish(judgements.miss) ||
		IsNullish(judgements.hit) ||
		IsNullish(judgements.rbreak) ||
		IsNullish(judgements.cbreak)
	) {
		return <td>No Data.</td>;
	}

	return (
		<td>
			<strong>
				<div>
					<span style={{ color: COLOUR_SET.gold }}>{judgements.cbreak}</span>-
					<span style={{ color: COLOUR_SET.orange }}>{judgements.rbreak}</span>-
					<span style={{ color: COLOUR_SET.vibrantBlue }}>{judgements.hit}</span>-
					<span style={{ color: COLOUR_SET.gray }}>{judgements.miss}</span>
				</div>
				<div>
					<span style={{ color: COLOUR_SET.vibrantYellow }}>
						{score.scoreData.optional.bellCount ?? "?"}/
						{score.scoreData.optional.totalBellCount ?? "?"}
					</span>
					<span style={{ color: COLOUR_SET.red, marginLeft: "0.5em" }}>
						{score.scoreData.optional.damage ?? "?"}
					</span>
				</div>
			</strong>
		</td>
	);
}
