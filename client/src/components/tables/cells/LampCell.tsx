import React from "react";
import { GetGamePTConfig, PBScoreDocument, ScoreDocument } from "tachi-common";
import { ChangeOpacity } from "util/color-opacity";

export default function LampCell({ sc }: { sc: ScoreDocument | PBScoreDocument }) {
	console.log(sc.game, sc.playtype);
	const gptConfig = GetGamePTConfig(sc.game, sc.playtype);

	return (
		<td
			style={{
				backgroundColor: ChangeOpacity(gptConfig.lampColours[sc.scoreData.lamp], 0.2),
			}}
		>
			<strong>{sc.scoreData.lamp}</strong>
		</td>
	);
}
