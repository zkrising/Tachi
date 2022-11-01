import { ChangeOpacity } from "util/color-opacity";
import { FormatMillions } from "util/misc";
import React from "react";
import { GetGamePTConfig, PBScoreDocument, ScoreDocument } from "tachi-common";

export default function JubeatScoreCell({ sc }: { sc: ScoreDocument | PBScoreDocument }) {
	const gptConfig = GetGamePTConfig(sc.game, sc.playtype);

	return (
		<td
			style={{
				backgroundColor: ChangeOpacity(gptConfig.gradeColours[sc.scoreData.grade], 0.2),
			}}
		>
			<strong>{sc.scoreData.grade}</strong>
			<br />
			<b>{sc.scoreData.percent.toFixed(2)}%</b>
			<br />
			{FormatMillions(sc.scoreData.score)}
		</td>
	);
}
