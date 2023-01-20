import { ChangeOpacity } from "util/color-opacity";
import React from "react";
import { PBScoreDocument, ScoreDocument } from "tachi-common";
import { GetEnumColour } from "lib/game-implementations";
import ITGJudgementCell from "../cells/ITGJudgementCell";
import LampCell from "../cells/LampCell";
import RatingCell from "../cells/RatingCell";
import ScoreCell from "../cells/ScoreCell";

export default function ITGCoreCells({
	sc,
	rating,
	short,
}: {
	sc: ScoreDocument<"itg:Stamina"> | PBScoreDocument<"itg:Stamina">;
	rating: keyof ScoreDocument["calculatedData"];
	short: boolean;
}) {
	return (
		<>
			<ScoreCell
				colour={GetEnumColour(sc, "grade")}
				grade={sc.scoreData.grade}
				percent={sc.scoreData.scorePercent}
			/>
			<ITGJudgementCell score={sc} />
			<td
				style={{
					backgroundColor: ChangeOpacity(GetEnumColour(sc, "lamp"), 0.2),
				}}
			>
				{sc.scoreData.lamp === "FAILED" ? (
					<strong>DIED @ {Math.floor(sc.scoreData.survivedPercent)}%</strong>
				) : (
					<strong>{sc.scoreData.lamp}</strong>
				)}
			</td>
			{!short && <RatingCell score={sc} rating={rating} />}
		</>
	);
}
