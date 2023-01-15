import React from "react";
import { GPTString, PBScoreDocument, ScoreRatingAlgorithms, ScoreDocument } from "tachi-common";
import { GetEnumColour } from "lib/game-implementations";
import LampCell from "../cells/LampCell";
import MillionsScoreCell from "../cells/MillionsScoreCell";
import MusecaJudgementCell from "../cells/MusecaJudgementCell";
import RatingCell from "../cells/RatingCell";

export default function MusecaCoreCells({
	sc,
	rating,
}: {
	sc: ScoreDocument<"museca:Single"> | PBScoreDocument<"museca:Single">;
	rating: ScoreRatingAlgorithms[GPTString];
}) {
	return (
		<>
			<MillionsScoreCell
				score={sc.scoreData.score}
				grade={sc.scoreData.grade}
				colour={GetEnumColour(sc, "grade")}
			/>
			<MusecaJudgementCell score={sc} />
			<LampCell lamp={sc.scoreData.lamp} colour={GetEnumColour(sc, "lamp")} />
			<RatingCell score={sc} rating={rating} />
		</>
	);
}
