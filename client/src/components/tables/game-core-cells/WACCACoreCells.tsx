import React from "react";
import { PBScoreDocument, ScoreDocument } from "tachi-common";
import { GetEnumColour } from "lib/game-implementations";
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
			<MillionsScoreCell
				score={sc.scoreData.score}
				grade={sc.scoreData.grade}
				colour={GetEnumColour(sc, "grade")}
			/>
			<WaccaJudgementCell score={sc} />
			<LampCell lamp={sc.scoreData.lamp} colour={GetEnumColour(sc, "lamp")} />
			<RatingCell score={sc} rating={rating} />
		</>
	);
}
