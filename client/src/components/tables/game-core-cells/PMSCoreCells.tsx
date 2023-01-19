import { GetEnumColour } from "lib/game-implementations";
import React from "react";
import {
	GPTString,
	IIDXLIKE_GBOUNDARIES,
	PBScoreDocument,
	ScoreDocument,
	ScoreRatingAlgorithms,
} from "tachi-common";
import BMSOrPMSLampCell from "../cells/BMSOrPMSLampCell";
import DeltaCell from "../cells/DeltaCell";
import RatingCell from "../cells/RatingCell";
import ScoreCell from "../cells/ScoreCell";

export default function PMSCoreCells({
	sc,
	rating,
	short,
}: {
	sc:
		| PBScoreDocument<"pms:Controller" | "pms:Keyboard">
		| ScoreDocument<"pms:Controller" | "pms:Keyboard">;
	rating: ScoreRatingAlgorithms[GPTString];
	short: boolean;
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
				formatNumFn={(deltaPercent) => {
					const max = Math.floor(sc.scoreData.score / (sc.scoreData.percent / 100));

					const v = (deltaPercent / 100) * max;

					return Math.floor(v).toFixed(0);
				}}
			/>
			<BMSOrPMSLampCell score={sc} />
			{!short && <RatingCell score={sc} rating={rating} />}
		</>
	);
}
