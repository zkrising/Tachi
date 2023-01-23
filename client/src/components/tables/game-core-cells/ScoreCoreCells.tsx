import useScoreRatingAlg from "components/util/useScoreRatingAlg";
import { GPT_CLIENT_IMPLEMENTATIONS } from "lib/game-implementations";
import React from "react";
import {
	AnyScoreRatingAlg,
	ChartDocument,
	Game,
	GetGPTString,
	PBScoreDocument,
	ScoreDocument,
} from "tachi-common";

export default function ScoreCoreCells({
	game,
	score,
	rating,
	chart,

	// should we show the rating cell or not?
	short = false,
}: {
	score: ScoreDocument | PBScoreDocument;
	chart: ChartDocument;
	rating?: AnyScoreRatingAlg;
	game: Game;
	short?: boolean;
}): JSX.Element {
	const [defaultRating] = useScoreRatingAlg(game, chart.playtype);

	const gptImpl = GPT_CLIENT_IMPLEMENTATIONS[GetGPTString(game, chart.playtype)];

	// fallback to this users preferred rating if none provided.
	// @ts-expect-error whateverr
	const rt: AnyScoreRatingAlg = rating ?? defaultRating;

	const sc = score as any; // lazy hack
	const ch = chart as any;

	if (short) {
		// @ts-expect-error it thinks things won't be synced up, but they are. don't worry.
		return gptImpl.scoreCoreCells({ sc, chart: ch });
	}

	return (
		<>
			{/* @ts-expect-error this will work, but the types don't like the signature ambiguity. */}
			{gptImpl.scoreCoreCells({ sc, chart: ch })}
			{/* @ts-expect-error see above */}
			{gptImpl.ratingCell({ sc, chart: ch, rating: rt })}
		</>
	);
}
