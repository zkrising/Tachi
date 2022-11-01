import React from "react";
import { PBScoreDocument, ScoreDocument } from "tachi-common";
import JubeatJudgementCell from "../cells/JubeatJudgementCell";
import JubeatScoreCell from "../cells/JubeatScoreCell";
import LampCell from "../cells/LampCell";
import RatingCell from "../cells/RatingCell";

export default function JubeatCoreCells({
	sc,
	rating,
}: {
	sc: ScoreDocument<"jubeat:Single"> | PBScoreDocument<"jubeat:Single">;
	rating: keyof ScoreDocument["calculatedData"];
}) {
	return (
		<>
			<JubeatScoreCell sc={sc} />
			<JubeatJudgementCell score={sc} />
			<LampCell score={sc} />
			<RatingCell score={sc} rating={rating} />
		</>
	);
}
