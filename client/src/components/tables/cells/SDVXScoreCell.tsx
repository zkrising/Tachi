import React from "react";
import { GetGamePTConfig, PBScoreDocument, ScoreDocument } from "tachi-common";
import { GamePT } from "types/react";
import { ChangeOpacity } from "util/color-opacity";
import { FormatMillions } from "util/misc";

export default function SDVXScoreCell({ score }: { score: PBScoreDocument | ScoreDocument }) {
	const gptConfig = GetGamePTConfig("sdvx", "Single");

	return (
		<td
			style={{
				backgroundColor: ChangeOpacity(gptConfig.gradeColours[score.scoreData.grade], 0.2),
			}}
		>
			<strong>{score.scoreData.grade}</strong>
			<br />
			{FormatMillions(score.scoreData.score)}
		</td>
	);
}
