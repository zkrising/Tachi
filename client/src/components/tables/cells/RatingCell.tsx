import React from "react";
import { GetGamePTConfig, PBScoreDocument, ScoreDocument } from "tachi-common";
import { FormatScoreRating, IsNotNullish } from "util/misc";

export default function RatingCell({
	score,
	rating,
}: {
	score: ScoreDocument | PBScoreDocument;
	rating: keyof ScoreDocument["calculatedData"];
}) {
	const value = score.calculatedData[rating];

	return <td>{FormatScoreRating(score.game, score.playtype, rating, value)}</td>;
}
