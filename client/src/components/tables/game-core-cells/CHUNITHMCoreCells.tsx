import React from "react";
import { GetGamePTConfig, PBScoreDocument, ScoreDocument } from "tachi-common";
import { ChangeOpacity } from "util/color-opacity";
import { FormatMillions } from "util/misc";
import CHUNITHMJudgementCell from "../cells/CHUNITHMJudgementCell";
import JubeatJudgementCell from "../cells/JubeatJudgementCell";
import LampCell from "../cells/LampCell";
import RatingCell from "../cells/RatingCell";

export default function CHUNITHMCoreCells({
	sc,
	rating,
}: {
	sc: ScoreDocument<"chunithm:Single"> | PBScoreDocument<"chunithm:Single">;
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
				{FormatMillions(sc.scoreData.score)}
			</td>
			<CHUNITHMJudgementCell score={sc} />
			<LampCell score={sc} />
			<RatingCell score={sc} rating={rating} />
		</>
	);
}
