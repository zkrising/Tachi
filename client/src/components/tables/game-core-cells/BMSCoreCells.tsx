import React from "react";
import {
	GPTString,
	PBScoreDocument,
	ScoreRatingAlgorithms,
	ScoreDocument,
	IIDXLIKE_GBOUNDARIES,
	GetGPTString,
} from "tachi-common";
import { GPT_CLIENT_IMPLEMENTATIONS } from "lib/game-implementations";
import BMSOrPMSLampCell from "../cells/BMSOrPMSLampCell";
import DeltaCell from "../cells/DeltaCell";
import RatingCell from "../cells/RatingCell";
import ScoreCell from "../cells/ScoreCell";

export default function BMSCoreCells({
	sc,
	rating,
}: {
	sc: PBScoreDocument<"bms:7K" | "bms:14K"> | ScoreDocument<"bms:7K" | "bms:14K">;
	rating: ScoreRatingAlgorithms[GPTString];
}) {
	return (
		<>
			<ScoreCell
				colour={
					// @ts-expect-error lazy
					GPT_CLIENT_IMPLEMENTATIONS[GetGPTString(sc.game, sc.playtype)].enumColours
						.grade[sc.scoreData.grade]
				}
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
