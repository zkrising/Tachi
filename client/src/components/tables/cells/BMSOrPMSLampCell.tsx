import { ChangeOpacity } from "util/color-opacity";
import { IsNotNullish } from "util/misc";
import { GetEnumColour } from "lib/game-implementations";
import React from "react";
import { PBScoreDocument, ScoreDocument } from "tachi-common";

export default function BMSOrPMSLampCell({
	score,
}: {
	score:
		| ScoreDocument<"bms:7K" | "bms:14K" | "pms:Keyboard" | "pms:Controller">
		| PBScoreDocument<"bms:7K" | "bms:14K" | "pms:Keyboard" | "pms:Controller">;
}) {
	return (
		<td
			style={{
				backgroundColor: ChangeOpacity(GetEnumColour(score, "lamp"), 0.2),
			}}
		>
			<strong>{score.scoreData.lamp}</strong>
			{IsNotNullish(score.scoreData.optional.bp) && (
				<>
					<br />
					<small>[BP: {score.scoreData.optional.bp}]</small>
				</>
			)}
		</td>
	);
}
