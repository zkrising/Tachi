import React from "react";
import {
	Game,
	IDStrings,
	PBScoreDocument,
	ScoreCalculatedDataLookup,
	ScoreDocument,
} from "tachi-common";
import BMSCoreCells from "./BMSCoreCells";
import GenericCoreCells from "./GenericCoreCells";
import IIDXCoreCells from "./IIDXCoreCells";
import JubeatCoreCells from "./JubeatCoreCells";
import MusecaCoreCells from "./MusecaCoreCells";
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
			<IIDXCoreCells
				rating={rating as ScoreCalculatedDataLookup["iidx:SP" | "iidx:DP"]}
				sc={sc}
			/>
		);
	} else if (game === "bms") {
		return <BMSCoreCells sc={sc} rating={rating} />;
	} else if (game === "sdvx" || game === "usc") {
		return <SDVXScoreCoreCells sc={sc} />;
	} else if (game === "maimai") {
		return <GenericCoreCells showScore={false} sc={sc} rating={rating} />;
	} else if (game === "museca") {
		return <MusecaCoreCells sc={sc} rating={rating} />;
	} else if (game === "wacca") {
		return <WACCACoreCells sc={sc} rating={rating} />;
	} else if (game === "popn") {
		return <PopnCoreCells sc={sc} rating={rating} />;
	} else if (game === "jubeat") {
		return <JubeatCoreCells sc={sc} rating={rating} />;
	} else if (game === "chunithm") {
		return <GenericCoreCells sc={sc} rating={rating} />;
	} else if (game === "ddr") {
		return <GenericCoreCells sc={sc} rating={rating} />;
	} else if (game === "gitadora") {
		return <GenericCoreCells sc={sc} rating={rating} />;
	}

	return <GenericCoreCells sc={sc} rating={rating} />;
}
