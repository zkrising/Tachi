import React from "react";
import {
	GPTString,
	PBScoreDocument,
	ScoreRatingAlgorithms,
	ScoreDocument,
	IIDXLIKE_GBOUNDARIES,
	GetGPTString,
} from "tachi-common";
import { GPT_CLIENT_IMPLEMENTATIONS, GetEnumColour } from "lib/game-implementations";
import BMSOrPMSLampCell from "../cells/BMSOrPMSLampCell";
import DeltaCell from "../cells/DeltaCell";
import RatingCell from "../cells/RatingCell";
import ScoreCell from "../cells/ScoreCell";

export default function PMSCoreCells({
	sc,
	rating,
}: {
	sc:
		| PBScoreDocument<"pms:Controller" | "pms:Keyboard">
		| ScoreDocument<"pms:Controller" | "pms:Keyboard">;
	rating: ScoreRatingAlgorithms[GPTString];
}) {
	return (
		<>
			<ScoreCell
				colour={GetEnumColour(sc, "grade")}
				grade={sc.scoreData.grade}
				percent={sc.scoreData.percent}
				score={sc.scoreData.score}
			/>
			<DeltaCell
				gradeBoundaries={IIDXLIKE_GBOUNDARIES}
				value={sc.scoreData.percent}
				grade={sc.scoreData.grade}
			/>
			<BMSOrPMSLampCell score={sc} />
			<RatingCell score={sc} rating={rating} />
		</>
	);
}
