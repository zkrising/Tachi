import React from "react";
import { PBScoreDocument, ScoreDocument } from "tachi-common";
import LampCell from "../cells/LampCell";
import MillionsScoreCell from "../cells/MillionsScoreCell";
import RatingCell from "../cells/RatingCell";
import WaccaJudgementCell from "../cells/WACCAJudgementCell";

export default function WACCACoreCells({
	sc,
	rating,
}: {
	sc: ScoreDocument<"wacca:Single"> | PBScoreDocument<"wacca:Single">;
	rating: keyof ScoreDocument["calculatedData"];
}) {
	return (
		<>
			<MillionsScoreCell score={sc} />
			<WaccaJudgementCell score={sc} />
			<LampCell score={sc} />
			<RatingCell score={sc} rating={rating} />
		</>
	);
}
