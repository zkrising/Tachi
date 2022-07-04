import React from "react";
import { IDStrings, ScoreCalculatedDataLookup, ScoreDocument } from "tachi-common";
import LampCell from "../cells/LampCell";
import RatingCell from "../cells/RatingCell";
import ScoreCell from "../cells/ScoreCell";

export default function GenericCoreCells({
	sc,
	showScore,
	rating,
}: {
	sc: ScoreDocument;
	showScore?: boolean;
	rating: ScoreCalculatedDataLookup[IDStrings];
}) {
	return (
		<>
			<ScoreCell score={sc} showScore={showScore} />
			<LampCell score={sc} />
			<RatingCell score={sc} rating={rating} />
		</>
	);
}
