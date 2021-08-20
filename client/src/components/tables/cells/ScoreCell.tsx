import React from "react";
import { GetGamePTConfig, PBScoreDocument, ScoreDocument } from "tachi-common";
import { GamePT } from "types/react";
import { ChangeOpacity } from "util/color-opacity";
import { FormatMillions } from "util/misc";

export default function ScoreCell({
	score,
	showScore = true,
	scoreRenderFn,
}: {
	score: PBScoreDocument | ScoreDocument;
	showScore?: boolean;
	scoreRenderFn?: (s: number) => string;
}) {
	const gptConfig = GetGamePTConfig(score.game, score.playtype);

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
					<small className="text-muted">
						[
						{scoreRenderFn
							? scoreRenderFn(score.scoreData.score)
							: score.scoreData.score}
						]
					</small>
				</>
			)}
		</td>
	);
}
