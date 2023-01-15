import React from "react";
import { PBScoreDocument, ScoreDocument } from "tachi-common";
import { GetEnumColour } from "lib/game-implementations";
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
			<MillionsScoreCell
				score={sc.scoreData.score}
				grade={sc.scoreData.grade}
				colour={GetEnumColour(sc, "grade")}
			/>
			<CHUNITHMJudgementCell score={sc} />
			<LampCell lamp={sc.scoreData.lamp} colour={GetEnumColour(sc, "lamp")} />
			<RatingCell score={sc} rating={rating} />
		</>
	);
}
