import React from "react";
import { PBScoreDocument, ScoreDocument } from "tachi-common";
import { GetEnumColour } from "lib/game-implementations";
import LampCell from "../cells/LampCell";
import RatingCell from "../cells/RatingCell";
import ScoreCell from "../cells/ScoreCell";
import MaimaiDXJudgementCell from "../cells/MaimaiDXJudgementCell";

export default function MaimaiDXCoreCells({
	sc,
	rating,
	short,
}: {
	sc: ScoreDocument<"maimaidx:Single"> | PBScoreDocument<"maimaidx:Single">;
	rating: keyof ScoreDocument["calculatedData"];
	short: boolean;
}) {
	return (
		<>
			<ScoreCell
				colour={GetEnumColour(sc, "grade")}
				grade={sc.scoreData.grade}
				percent={sc.scoreData.percent}
			/>
			<MaimaiDXJudgementCell score={sc} />
			<LampCell lamp={sc.scoreData.lamp} colour={GetEnumColour(sc, "lamp")} />
			{!short && <RatingCell score={sc} rating={rating} />}
		</>
	);
}
