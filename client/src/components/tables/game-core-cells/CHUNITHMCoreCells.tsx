import React from "react";
import { PBScoreDocument, ScoreDocument } from "tachi-common";
import CHUNITHMJudgementCell from "../cells/CHUNITHMJudgementCell";
import LampCell from "../cells/LampCell";
import MillionsScoreCell from "../cells/MillionsScoreCell";
import RatingCell from "../cells/RatingCell";

export default function CHUNITHMCoreCells({
	sc,
	rating,
}: {
	sc: ScoreDocument<"chunithm:Single"> | PBScoreDocument<"chunithm:Single">;
	rating: keyof ScoreDocument["calculatedData"];
}) {
	return (
		<>
			<MillionsScoreCell score={sc} />
			<CHUNITHMJudgementCell score={sc} />
			<LampCell score={sc} />
			<RatingCell score={sc} rating={rating} />
		</>
	);
}
