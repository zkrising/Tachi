import React from "react";
import { PBScoreDocument, ScoreDocument } from "tachi-common";
import GitadoraJudgementCell from "../cells/GitadoraJudgementCell";
import LampCell from "../cells/LampCell";
import RatingCell from "../cells/RatingCell";
import ScoreCell from "../cells/ScoreCell";

export default function GitadoraCoreCells({
	sc,
	rating,
}: {
	sc:
		| ScoreDocument<"gitadora:Gita" | "gitadora:Dora">
		| PBScoreDocument<"gitadora:Gita" | "gitadora:Dora">;
	rating: keyof ScoreDocument["calculatedData"];
}) {
	return (
		<>
			<ScoreCell showScore={false} score={sc} />
			<GitadoraJudgementCell score={sc} />
			<LampCell score={sc} />
			<RatingCell score={sc} rating={rating} />
		</>
	);
}
