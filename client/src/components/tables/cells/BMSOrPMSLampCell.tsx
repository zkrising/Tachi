import React from "react";
import { GetGamePTConfig, PBScoreDocument, ScoreDocument } from "tachi-common";
import { ChangeOpacity } from "util/color-opacity";
import { IsNotNullish } from "util/misc";

export default function BMSOrPMSLampCell({
	score,
}: {
	score:
		| ScoreDocument<"bms:7K" | "bms:14K" | "pms:Keyboard" | "pms:Controller">
		| PBScoreDocument<"bms:7K" | "bms:14K" | "pms:Keyboard" | "pms:Controller">;
}) {
	const gptConfig = GetGamePTConfig(score.game, score.playtype);

	return (
		<td
			style={{
				backgroundColor: ChangeOpacity(gptConfig.lampColours[score.scoreData.lamp], 0.2),
			}}
		>
			<strong>{score.scoreData.lamp}</strong>
			{IsNotNullish(score.scoreData.hitMeta.bp) && (
				<>
					<br />
					<small>[BP: {score.scoreData.hitMeta.bp}]</small>
				</>
			)}
		</td>
	);
}
