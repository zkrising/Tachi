import React from "react";
import { PBScoreDocument, ScoreDocument } from "tachi-common";
import ITGJudgementCell from "../cells/ITGJudgementCell";
import LampCell from "../cells/LampCell";
import MillionsScoreCell from "../cells/MillionsScoreCell";
import PopnJudgementCell from "../cells/PopnJudgementCell";
import PopnLampCell from "../cells/PopnLampCell";
import RatingCell from "../cells/RatingCell";
import ScoreCell from "../cells/ScoreCell";

export default function ITGCoreCells({
	sc,
	rating,
}: {
	sc: ScoreDocument<"itg:Stamina"> | PBScoreDocument<"itg:Stamina">;
	rating: keyof ScoreDocument["calculatedData"];
}) {
	return (
		<>
			<ScoreCell showScore={false} score={sc} />
			<ITGJudgementCell score={sc} />
			<LampCell score={sc} />
			<RatingCell score={sc} rating={rating} />
		</>
	);
}
