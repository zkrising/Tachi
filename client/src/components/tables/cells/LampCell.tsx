import React from "react";
import { GetGamePTConfig, PBScoreDocument, ScoreDocument } from "tachi-common";
import { IsScore } from "util/asserts";
import { ChangeOpacity } from "util/color-opacity";
import { IsNotNullish, IsNullish } from "util/misc";

export default function LampCell({ sc }: { sc: ScoreDocument | PBScoreDocument }) {
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
