import { IsNullish } from "util/misc";
import React from "react";
import { COLOUR_SET, PBScoreDocument, ScoreDocument } from "tachi-common";

export default function OngekiJudgementCell({
	score,
	totalBellCount,
}: {
	score: ScoreDocument<"ongeki:Single"> | PBScoreDocument<"ongeki:Single">;
	totalBellCount: number | undefined;
}) {
	const judgements = score.scoreData.judgements;

	if (
		IsNullish(judgements.miss) ||
		IsNullish(judgements.hit) ||
		IsNullish(judgements.break) ||
		IsNullish(judgements.cbreak)
	) {
		return <td>No Data.</td>;
	}

	return (
		<td>
			<strong>
				<div>
					<span style={{ color: COLOUR_SET.gold }}>{judgements.cbreak}</span>-
					<span style={{ color: COLOUR_SET.orange }}>{judgements.break}</span>-
					<span style={{ color: COLOUR_SET.vibrantBlue }}>{judgements.hit}</span>-
					<span style={{ color: COLOUR_SET.gray }}>{judgements.miss}</span>
				</div>
				<div>
					<span style={{ color: COLOUR_SET.vibrantYellow }}>
						{score.scoreData.bellCount ?? "?"}/{totalBellCount ?? "?"}
					</span>
					<span style={{ color: COLOUR_SET.red, marginLeft: "0.5em" }}>
						{score.scoreData.optional.damage ?? "?"}
					</span>
				</div>
			</strong>
		</td>
	);
}
