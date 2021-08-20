import React from "react";
import { GetGamePTConfig, PBScoreDocument, ScoreDocument } from "tachi-common";
import { IsNotNullish } from "util/misc";

export default function RatingCell({ score }: { score: ScoreDocument | PBScoreDocument }) {
	const gptConfig = GetGamePTConfig(score.game, score.playtype);

	const v = score.calculatedData[gptConfig.defaultScoreRatingAlg];

	return <td>{IsNotNullish(v) ? v!.toFixed(2) : "No Data"}</td>;
}
