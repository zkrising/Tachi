import React from "react";
import { PBScoreDocument, ScoreDocument } from "tachi-common";
import { GetEnumColour } from "lib/game-implementations";
import MillionsScoreCell from "../cells/MillionsScoreCell";
import PopnJudgementCell from "../cells/PopnJudgementCell";
import PopnLampCell from "../cells/PopnLampCell";
import RatingCell from "../cells/RatingCell";

export default function PopnCoreCells({
	sc,
	rating,
	short,
}: {
	sc: ScoreDocument<"popn:9B"> | PBScoreDocument<"popn:9B">;
	rating: keyof ScoreDocument["calculatedData"];
	short: boolean;
}) {
	return (
		<>
			<MillionsScoreCell
				score={sc.scoreData.score}
				grade={sc.scoreData.grade}
				colour={GetEnumColour(sc, "grade")}
			/>
			<PopnJudgementCell score={sc} />
			<PopnLampCell score={sc} />
			{!short && <RatingCell score={sc} rating={rating} />}
		</>
	);
}
