import React from "react";
import {
	ChartDocument,
	Game,
	GPTString,
	PBScoreDocument,
	ScoreRatingAlgorithms,
	ScoreDocument,
	AnyScoreRatingAlg,
} from "tachi-common";
import useScoreRatingAlg from "components/util/useScoreRatingAlg";
import BMSCoreCells from "./BMSCoreCells";
import CHUNITHMCoreCells from "./CHUNITHMCoreCells";
import IIDXCoreCells from "./IIDXCoreCells";
import ITGCoreCells from "./ITGCoreCells";
import JubeatCoreCells from "./JubeatCoreCells";
import MusecaCoreCells from "./MusecaCoreCells";
import PMSCoreCells from "./PMSCoreCells";
import PopnCoreCells from "./PopnCoreCells";
import SDVXScoreCoreCells from "./SDVXCoreCells";
import WACCACoreCells from "./WACCACoreCells";
import GitadoraCoreCells from "./GitadoraCoreCells";
import MaimaiDXCoreCells from "./MaimaiDXCoreCells";

export default function ScoreCoreCells({
	game,
	score,
	rating,
	chart,
}: {
	score: ScoreDocument | PBScoreDocument;
	chart: ChartDocument;
	rating?: AnyScoreRatingAlg;
	game: Game;
}): JSX.Element {
	const [defaultRating] = useScoreRatingAlg(game, chart.playtype);

	// fallback to this users preferred rating if none provided.
	// @ts-expect-error whateverr
	const rt: AnyScoreRatingAlg = rating ?? defaultRating;

	const sc = score as any; // lazy hack

	switch (game) {
		case "iidx":
			return (
				<IIDXCoreCells
					rating={rt as ScoreRatingAlgorithms["iidx:SP" | "iidx:DP"]}
					chart={chart as ChartDocument<"iidx:SP" | "iidx:DP">}
					sc={sc}
				/>
			);
		case "bms":
			return <BMSCoreCells sc={sc} rating={rt} />;
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
			return <MusecaCoreCells sc={sc} rating={rt} />;
		case "wacca":
			return <WACCACoreCells sc={sc} rating={rt} />;
		case "popn":
			return <PopnCoreCells sc={sc} rating={rt} />;
		case "jubeat":
			return <JubeatCoreCells sc={sc} rating={rt} />;
		case "chunithm":
			return <CHUNITHMCoreCells sc={sc} rating={rt} />;
		case "gitadora":
			return <GitadoraCoreCells sc={sc} rating={rt} />;
		case "pms":
			return <PMSCoreCells sc={sc} rating={rt} />;
		case "itg":
			return <ITGCoreCells sc={sc} rating={rt} />;
		case "maimaidx":
			return <MaimaiDXCoreCells sc={sc} rating={rt} />;
	}
}
