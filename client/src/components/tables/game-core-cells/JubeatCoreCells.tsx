import React from "react";
import { GetGamePTConfig, PBScoreDocument, ScoreDocument } from "tachi-common";
import { ChangeOpacity } from "util/color-opacity";
import { FormatMillions, IsNullish } from "util/misc";
import JubeatJudgementCell from "../cells/JubeatJudgementCell";
import LampCell from "../cells/LampCell";

export default function JubeatCoreCells({
	sc,
}: {
	sc: ScoreDocument<"jubeat:Single"> | PBScoreDocument<"jubeat:Single">;
}) {
	const gptConfig = GetGamePTConfig(sc.game, sc.playtype);

	return (
		<>
			<td
				style={{
					backgroundColor: ChangeOpacity(gptConfig.gradeColours[sc.scoreData.grade], 0.2),
				}}
			>
				<strong>{sc.scoreData.grade}</strong>
				<br />
				{sc.scoreData.percent.toFixed(2)}%
				<br />
				{FormatMillions(sc.scoreData.score)}
			</td>
			<JubeatJudgementCell score={sc} />
			<LampCell score={sc} />
			<td>
				{!IsNullish(sc.calculatedData.jubility)
					? sc.calculatedData.jubility!.toFixed(2)
					: "N/A"}
			</td>
		</>
	);
}
