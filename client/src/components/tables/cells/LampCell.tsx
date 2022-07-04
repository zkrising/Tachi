import { ChangeOpacity } from "util/color-opacity";
import React from "react";
import { GetGamePTConfig, PBScoreDocument, ScoreDocument } from "tachi-common";

export default function LampCell({ score }: { score: ScoreDocument | PBScoreDocument }) {
	const gptConfig = GetGamePTConfig(score.game, score.playtype);

	return (
		<td
			style={{
				backgroundColor: ChangeOpacity(gptConfig.lampColours[score.scoreData.lamp], 0.2),
			}}
		>
			<strong>{score.scoreData.lamp}</strong>
		</td>
	);
}
