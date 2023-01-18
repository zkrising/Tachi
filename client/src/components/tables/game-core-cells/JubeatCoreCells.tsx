import React from "react";
import { PBScoreDocument, ScoreDocument } from "tachi-common";
import { GetEnumColour } from "lib/game-implementations";
import JubeatJudgementCell from "../cells/JubeatJudgementCell";
import JubeatScoreCell from "../cells/JubeatScoreCell";
import JubilityCell from "../cells/JubilityCell";
import LampCell from "../cells/LampCell";

export default function JubeatCoreCells({
	sc,
	short,
}: {
	sc: ScoreDocument<"jubeat:Single"> | PBScoreDocument<"jubeat:Single">;
	rating: keyof ScoreDocument["calculatedData"];
	short: boolean;
}) {
	return (
		<>
			<JubeatScoreCell sc={sc} />
			<JubeatJudgementCell score={sc} />
			<LampCell lamp={sc.scoreData.lamp} colour={GetEnumColour(sc, "lamp")} />
			{!short && <JubilityCell score={sc} />}
		</>
	);
}
