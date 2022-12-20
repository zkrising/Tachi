import React from "react";
import {
	ChartDocument,
	Game,
	IDStrings,
	PBScoreDocument,
	ScoreCalculatedDataLookup,
	ScoreDocument,
} from "tachi-common";
import BMSCoreCells from "./BMSCoreCells";
import CHUNITHMCoreCells from "./CHUNITHMCoreCells";
import GenericCoreCells from "./GenericCoreCells";
import IIDXCoreCells from "./IIDXCoreCells";
import ITGCoreCells from "./ITGCoreCells";
import JubeatCoreCells from "./JubeatCoreCells";
import MusecaCoreCells from "./MusecaCoreCells";
import PMSCoreCells from "./PMSCoreCells";
import PopnCoreCells from "./PopnCoreCells";
import SDVXScoreCoreCells from "./SDVXCoreCells";
import WACCACoreCells from "./WACCACoreCells";
import GitadoraCoreCells from "./GitadoraCoreCells";

export default function ScoreCoreCells({
	game,
	score,
	rating,
	chart,
}: {
	score: ScoreDocument | PBScoreDocument;
	chart: ChartDocument;
	rating: ScoreCalculatedDataLookup[IDStrings];
	game: Game;
}) {
	const sc = score as any; // lazy hack

	switch (game) {
		case "iidx":
			return (
				<IIDXCoreCells
					rating={rating as ScoreCalculatedDataLookup["iidx:SP" | "iidx:DP"]}
					chart={chart as ChartDocument<"iidx:SP" | "iidx:DP">}
					sc={sc}
				/>
			);
		case "bms":
			return <BMSCoreCells sc={sc} rating={rating} />;
		case "sdvx":
		case "usc":
			return (
				<SDVXScoreCoreCells
					sc={sc}
					chart={
						chart as ChartDocument<"sdvx:Single" | "usc:Controller" | "usc:Keyboard">
					}
				/>
			);
		case "museca":
			return <MusecaCoreCells sc={sc} rating={rating} />;
		case "wacca":
			return <WACCACoreCells sc={sc} rating={rating} />;
		case "popn":
			return <PopnCoreCells sc={sc} rating={rating} />;
		case "jubeat":
			return <JubeatCoreCells sc={sc} rating={rating} />;
		case "chunithm":
			return <CHUNITHMCoreCells sc={sc} rating={rating} />;
		case "gitadora":
			return <GitadoraCoreCells sc={sc} rating={rating} />;
		case "pms":
			return <PMSCoreCells sc={sc} rating={rating} />;
		case "itg":
			return <ITGCoreCells sc={sc} rating={rating} />;
	}
}
