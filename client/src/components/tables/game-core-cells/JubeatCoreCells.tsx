import React from "react";
import { PBScoreDocument, ScoreDocument } from "tachi-common";
import JubeatJudgementCell from "../cells/JubeatJudgementCell";
import JubeatScoreCell from "../cells/JubeatScoreCell";
import JubilityCell from "../cells/JubilityCell";
import LampCell from "../cells/LampCell";

export default function JubeatCoreCells({
	sc,
	rating,
}: {
	sc: ScoreDocument<"jubeat:Single"> | PBScoreDocument<"jubeat:Single">;
	rating: keyof ScoreDocument["calculatedData"];
}) {
	return (
		<>
			<JubeatScoreCell sc={sc} />
			<JubeatJudgementCell score={sc} />
			<LampCell score={sc} />
			<JubilityCell score={sc} />
		</>
	);
}
