import React from "react";
import { PBScoreDocument, ScoreDocument } from "tachi-common";
import LampCell from "../cells/LampCell";
import RatingCell from "../cells/RatingCell";
import ScoreCell from "../cells/ScoreCell";
import MaimaiDXJudgementCell from "../cells/MaimaiDXJudgementCell";

export default function MaimaiDXCoreCells({
	sc,
	rating,
}: {
	sc: ScoreDocument<"maimaidx:Single"> | PBScoreDocument<"maimaidx:Single">;
	rating: keyof ScoreDocument["calculatedData"];
}) {
	return (
		<>
			<ScoreCell showScore={false} score={sc} />
			<MaimaiDXJudgementCell score={sc} />
			<LampCell score={sc} />
			<RatingCell score={sc} rating={rating} />
		</>
	);
}
