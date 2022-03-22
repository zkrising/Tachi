import { ChangeOpacity } from "util/color-opacity";
import React from "react";
import { GetGamePTConfig, PBScoreDocument, ScoreDocument } from "tachi-common";

// Lamp cell, but if the lamp is FAILED, display it slightly differently.
export default function SDVXLampCell({
	score,
}: {
	score:
		| ScoreDocument<"sdvx:Single" | "usc:Controller" | "usc:Keyboard">
		| PBScoreDocument<"sdvx:Single" | "usc:Controller" | "usc:Keyboard">;
}) {
	const gptConfig = GetGamePTConfig(score.game, score.playtype);

	return (
		<td
			style={{
				backgroundColor: ChangeOpacity(gptConfig.lampColours[score.scoreData.lamp], 0.2),
			}}
		>
			<strong>{score.scoreData.lamp === "FAILED" ? "PLAYED" : score.scoreData.lamp}</strong>
		</td>
	);
}
