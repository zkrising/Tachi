import React from "react";
import { PBScoreDocument, ScoreDocument } from "tachi-common";
import { GetEnumColour } from "lib/game-implementations";
import GitadoraJudgementCell from "../cells/GitadoraJudgementCell";
import LampCell from "../cells/LampCell";
import RatingCell from "../cells/RatingCell";
import ScoreCell from "../cells/ScoreCell";

export default function GitadoraCoreCells({
	sc,
	rating,
	short,
}: {
	sc:
		| ScoreDocument<"gitadora:Gita" | "gitadora:Dora">
		| PBScoreDocument<"gitadora:Gita" | "gitadora:Dora">;
	rating: keyof ScoreDocument["calculatedData"];
	short: boolean;
}) {
	return (
		<>
			<ScoreCell
				colour={GetEnumColour(sc, "grade")}
				grade={sc.scoreData.grade}
				percent={sc.scoreData.percent}
			/>
			<GitadoraJudgementCell score={sc} />
			<LampCell lamp={sc.scoreData.lamp} colour={GetEnumColour(sc, "lamp")} />
			{!short && <RatingCell score={sc} rating={rating} />}
		</>
	);
}
