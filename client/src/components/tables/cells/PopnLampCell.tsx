import Muted from "components/util/Muted";
import React from "react";
import { GetGamePTConfig, PBScoreDocument, ScoreDocument } from "tachi-common";
import { ChangeOpacity } from "util/color-opacity";

export default function PopnLampCell({
	score,
}: {
	score: ScoreDocument<"popn:9B"> | PBScoreDocument<"popn:9B">;
}) {
	const gptConfig = GetGamePTConfig(score.game, score.playtype);

	return (
		<td
			style={{
				backgroundColor: ChangeOpacity(gptConfig.lampColours[score.scoreData.lamp], 0.2),
			}}
		>
			<strong>{score.scoreData.lamp}</strong>
			<br />
			<Muted>
				TEMPORARY SCT STUFF: {score.scoreData.hitMeta.specificClearType ?? "Unknown"}
			</Muted>
		</td>
	);
}
