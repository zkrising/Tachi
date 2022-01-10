import React from "react";
import { IDStrings, PBScoreDocument, ScoreCalculatedDataLookup, ScoreDocument } from "tachi-common";
import LampCell from "../cells/LampCell";
import MillionsScoreCell from "../cells/MillionsScoreCell";
import MusecaJudgementCell from "../cells/MusecaJudgementCell";
import RatingCell from "../cells/RatingCell";

export default function MusecaCoreCells({
	sc,
	rating,
}: {
	sc: ScoreDocument<"museca:Single"> | PBScoreDocument<"museca:Single">;
	rating: ScoreCalculatedDataLookup[IDStrings];
}) {
	return (
		<>
			<MillionsScoreCell score={sc} />
			<MusecaJudgementCell score={sc} />
			<LampCell score={sc} />
			<RatingCell score={sc} rating={rating} />
		</>
	);
}
