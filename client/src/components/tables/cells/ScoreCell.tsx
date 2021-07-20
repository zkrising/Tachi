import React from "react";
import { GetGamePTConfig, PBScoreDocument, ScoreDocument } from "tachi-common";
import { GamePT } from "types/react";
import { ChangeOpacity } from "util/color-opacity";

export default function ScoreCell({
	game,
	playtype,
	score,
	showScore = true,
}: GamePT & { score: PBScoreDocument | ScoreDocument; showScore?: boolean }) {
	const gptConfig = GetGamePTConfig(game, playtype);

	return (
		<td
			style={{
				backgroundColor: ChangeOpacity(gptConfig.gradeColours[score.scoreData.grade], 0.2),
			}}
		>
			<strong>{score.scoreData.grade}</strong>
			<br />
			{`${score.scoreData.percent.toFixed(2)}%`}
			{showScore && (
				<>
					<br />
					<small className="text-muted">[{score.scoreData.score}]</small>
				</>
			)}
		</td>
	);
}
