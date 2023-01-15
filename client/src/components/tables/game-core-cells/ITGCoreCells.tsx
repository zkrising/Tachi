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
}: {
	sc: ScoreDocument<"itg:Stamina"> | PBScoreDocument<"itg:Stamina">;
	rating: keyof ScoreDocument["calculatedData"];
}) {
	return (
		<>
			<ScoreCell showScore={false} score={sc} />
			<ITGJudgementCell score={sc} />
			<LampCell lamp={sc.scoreData.lamp} colour={GetEnumColour(sc, "lamp")} />
			<RatingCell score={sc} rating={rating} />
		</>
	);
}
