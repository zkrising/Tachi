import { ChangeOpacity } from "util/color-opacity";
import { GetEnumColour } from "lib/game-implementations";
import React from "react";
import { COLOUR_SET, ChartDocument, PBScoreDocument, ScoreDocument } from "tachi-common";

// Lamp cell, but if the lamp is FAILED, display it slightly differently.
export default function SDVXLampCell({
	score,
	chart,
}: {
	score:
		| ScoreDocument<"sdvx:Single" | "usc:Controller" | "usc:Keyboard">
		| PBScoreDocument<"sdvx:Single" | "usc:Controller" | "usc:Keyboard">;
	chart?: ChartDocument<"sdvx:Single">;
}) {
	const exScore = "exScore" in score.scoreData.optional ? score.scoreData.optional.exScore : 0;
	const maxExScore = chart?.data.maxExScore ?? 1;
	const sPuc = maxExScore === exScore;
	return (
		<td
			style={
				sPuc
					? { backgroundColor: ChangeOpacity(COLOUR_SET.gold, 0.2) }
					: {
							backgroundColor: ChangeOpacity(GetEnumColour(score, "lamp"), 0.2),
					  }
			}
		>
			<strong>
				{(score.scoreData.lamp === "FAILED" ? "PLAYED" : score.scoreData.lamp) &&
					(sPuc ? "S-PUC" : score.scoreData.lamp)}
			</strong>
		</td>
	);
}
