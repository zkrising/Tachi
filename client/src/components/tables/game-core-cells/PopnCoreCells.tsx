import React from "react";
import { PBScoreDocument, ScoreDocument } from "tachi-common";
import MillionsScoreCell from "../cells/MillionsScoreCell";
import PopnJudgementCell from "../cells/PopnJudgementCell";
import PopnLampCell from "../cells/PopnLampCell";
import RatingCell from "../cells/RatingCell";

export default function PopnCoreCells({
	sc,
	rating,
}: {
	sc: ScoreDocument<"popn:9B"> | PBScoreDocument<"popn:9B">;
	rating: keyof ScoreDocument["calculatedData"];
}) {
	return (
		<>
			<MillionsScoreCell score={sc} />
			<PopnJudgementCell score={sc} />
			<PopnLampCell score={sc} />
			<RatingCell score={sc} rating={rating} />
		</>
	);
}
