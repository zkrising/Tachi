import React from "react";
import { ScoreDocument } from "tachi-common";
import LampCell from "../cells/LampCell";
import RatingCell from "../cells/RatingCell";
import ScoreCell from "../cells/ScoreCell";

export default function GenericScoreCoreCells({
	sc,
	showScore,
}: {
	sc: ScoreDocument;
	showScore?: boolean;
}) {
	return (
		<>
			<ScoreCell score={sc} showScore={showScore} />
			<LampCell score={sc} />
			<RatingCell score={sc} />
		</>
	);
}
