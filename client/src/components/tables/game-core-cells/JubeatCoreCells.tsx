import { ChangeOpacity } from "util/color-opacity";
import { FormatMillions } from "util/misc";
import React from "react";
import { GetGamePTConfig, PBScoreDocument, ScoreDocument } from "tachi-common";
import JubeatJudgementCell from "../cells/JubeatJudgementCell";
import LampCell from "../cells/LampCell";
import RatingCell from "../cells/RatingCell";

export default function JubeatCoreCells({
	sc,
	rating,
}: {
	sc: ScoreDocument<"jubeat:Single"> | PBScoreDocument<"jubeat:Single">;
	rating: keyof ScoreDocument["calculatedData"];
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
				<b>{sc.scoreData.percent.toFixed(2)}%</b>
				<br />
				{FormatMillions(sc.scoreData.score)}
			</td>
			<JubeatJudgementCell score={sc} />
			<LampCell score={sc} />
			<RatingCell score={sc} rating={rating} />
		</>
	);
}
