import { nanoid } from "nanoid";
import React from "react";
import {
	Game,
	IDStrings,
	PBScoreDocument,
	ScoreCalculatedDataLookup,
	ScoreDocument,
} from "tachi-common";
import { SetState } from "types/react";
import { FolderDataset, PBDataset, ScoreDataset } from "types/tables";
import { Playtype } from "types/tachi";
import { NumericSOV } from "util/sorts";
import SelectableRating from "../components/SelectableRating";
import { Header, ZTableTHProps } from "../components/TachiTable";

export function GetGPTCoreHeaders<Dataset extends FolderDataset | PBDataset | ScoreDataset>(
	game: Game,
	playtype: Playtype,
	rating: ScoreCalculatedDataLookup[IDStrings],
	setRating: SetState<ScoreCalculatedDataLookup[IDStrings]>,
	kMapToScoreOrPB: (k: Dataset[0]) => PBScoreDocument | ScoreDocument | null
): Header<Dataset[0]>[] {
	const ScoreHeader: Header<Dataset[0]> = [
		"Score",
		"Score",
		NumericSOV(x => kMapToScoreOrPB(x)?.scoreData.percent ?? -Infinity),
	];

	const LampHeader: Header<Dataset[0]> = [
		"Lamp",
		"Lamp",
		NumericSOV(x => kMapToScoreOrPB(x)?.scoreData.lampIndex ?? -Infinity),
	];

	const RatingHeader: Header<Dataset[0]> = [
		"Rating",
		"Rating",
		NumericSOV(x => kMapToScoreOrPB(x)?.calculatedData[rating] ?? 0),
		(thProps: ZTableTHProps) => (
			<SelectableRating
				key={nanoid()}
				game={game}
				playtype={playtype}
				rating={rating}
				setRating={setRating}
				{...thProps}
			/>
		),
	];

	switch (game) {
		case "sdvx":
		case "museca":
		case "usc":
			return [
				ScoreHeader,
				[
					"Near - Miss",
					"Nr. Ms.",
					NumericSOV(x => kMapToScoreOrPB(x)?.scoreData.percent ?? -Infinity),
				],
				LampHeader,
				RatingHeader,
			];
		case "iidx":
		case "bms":
			return [
				ScoreHeader,
				[
					"Deltas",
					"Deltas",
					NumericSOV(x => kMapToScoreOrPB(x)?.scoreData.percent ?? -Infinity),
				],
				LampHeader,
				RatingHeader,
			];
		case "gitadora":
		case "ddr":
		case "jubeat":
		case "wacca":
		case "chunithm":
		case "popn":
		case "maimai":
			return [
				ScoreHeader,
				[
					"Judgements",
					"Hits",
					NumericSOV(x => kMapToScoreOrPB(x)?.scoreData.percent ?? -Infinity),
				],
				LampHeader,
				RatingHeader,
			];
	}
}
