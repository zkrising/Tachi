import React from "react";
import { PBScoreDocument } from "tachi-common";

export default function RankingCell({
	rankingData,
}: {
	rankingData: PBScoreDocument["rankingData"];
}) {
	return (
		<td>
			<strong>#{rankingData.rank}</strong>
			<small>/{rankingData.outOf}</small>
		</td>
	);
}
