import React from "react";
import {
	Game,
	IDStrings,
	PBScoreDocument,
	ScoreCalculatedDataLookup,
	ScoreDocument,
} from "tachi-common";
import BMSScoreCoreCells from "./BMSScoreCoreCells";
import GenericScoreCoreCells from "./GenericScoreCoreCells";
import IIDXScoreCoreCells from "./IIDXScoreCoreCells";
import MusecaScoreCoreCells from "./MusecaScoreCoreCells";
import PopnCoreCells from "./PopnCoreCells";
import SDVXScoreCoreCells from "./SDVXCoreCells";
import WACCACoreCells from "./WACCACoreCells";

export default function ScoreCoreCells({
	game,
	score,
	rating,
}: {
	score: ScoreDocument | PBScoreDocument;
	rating: ScoreCalculatedDataLookup[IDStrings];
	game: Game;
}) {
	const sc = score as any; // lazy hack

	if (game === "iidx") {
		return (
			<IIDXScoreCoreCells
				rating={rating as ScoreCalculatedDataLookup["iidx:SP" | "iidx:DP"]}
				sc={sc}
			/>
		);
	} else if (game === "bms") {
		return <BMSScoreCoreCells sc={sc} />;
	} else if (game === "sdvx" || game === "usc") {
		return <SDVXScoreCoreCells sc={sc} />;
	} else if (game === "maimai") {
		return <GenericScoreCoreCells showScore={false} sc={sc} />;
	} else if (game === "museca") {
		return <MusecaScoreCoreCells sc={sc} />;
	} else if (game === "wacca") {
		return <WACCACoreCells sc={sc} />;
	} else if (game === "popn") {
		return <PopnCoreCells sc={sc} />;
	}

	return <GenericScoreCoreCells sc={sc} />;
}
