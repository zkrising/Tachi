import React from "react";
import { GetGamePTConfig, PBScoreDocument } from "tachi-common";
import { GamePT } from "types/react";
import { ChangeOpacity } from "util/color-opacity";

export default function ScoreCell({
	game,
	playtype,
	pb,
	showScore = true,
}: GamePT & { pb: PBScoreDocument; showScore?: boolean }) {
	const gptConfig = GetGamePTConfig(game, playtype);

	return (
		<td
			style={{
				backgroundColor: ChangeOpacity(gptConfig.gradeColours[pb.scoreData.grade], 0.2),
			}}
		>
			<strong>{pb.scoreData.grade}</strong>
			<br />
			{`${pb.scoreData.percent.toFixed(2)}%`}
			{showScore && (
				<>
					<br />
					<small className="text-muted">[{pb.scoreData.score}]</small>
				</>
			)}
		</td>
	);
}
