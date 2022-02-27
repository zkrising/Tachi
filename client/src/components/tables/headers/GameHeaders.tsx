import React from "react";
import {
	Game,
	GetGamePTConfig,
	IDStrings,
	PBScoreDocument,
	ScoreCalculatedDataLookup,
	ScoreDocument,
} from "tachi-common";
import { SetState } from "types/react";
import { FolderDataset, PBDataset, ScoreDataset } from "types/tables";
import { Playtype } from "types/tachi";
import { UppercaseFirst } from "util/misc";
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

	let RatingHeader: Header<Dataset[0]>;

	const gptConfig = GetGamePTConfig(game, playtype);

	if (gptConfig.scoreRatingAlgs.length === 1) {
		const alg = gptConfig.scoreRatingAlgs[0];

		RatingHeader = [
			UppercaseFirst(alg),
			UppercaseFirst(alg),
			NumericSOV(x => kMapToScoreOrPB(x)?.calculatedData[alg] ?? -Infinity),
		];
	} else {
		RatingHeader = [
			"Rating",
			"Rating",
			NumericSOV(x => kMapToScoreOrPB(x)?.calculatedData[rating] ?? -Infinity),
			(thProps: ZTableTHProps) => (
				<SelectableRating
					key={`${game}-${playtype}`}
					game={game}
					playtype={playtype}
					rating={rating}
					setRating={setRating}
					{...thProps}
				/>
			),
		];
	}

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
		case "pms":
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
		case "popn":
			return [
				ScoreHeader,
				[
					"Judgements",
					"Hits",
					NumericSOV(x => kMapToScoreOrPB(x)?.scoreData.percent ?? -Infinity),
				],
				[
					"Lamp",
					"Lamp",
					(a, b) => {
						const aSc = kMapToScoreOrPB(a) as
							| ScoreDocument<"popn:9B">
							| PBScoreDocument<"popn:9B">;
						const bSc = kMapToScoreOrPB(b) as
							| ScoreDocument<"popn:9B">
							| PBScoreDocument<"popn:9B">;

						if (!aSc && bSc) {
							return -Infinity;
						}

						if (aSc && !bSc) {
							return Infinity;
						}

						if (aSc.scoreData.lampIndex === bSc.scoreData.lampIndex) {
							if (
								!aSc.scoreData.hitMeta.specificClearType ||
								!bSc.scoreData.hitMeta.specificClearType
							) {
								return -Infinity;
							}

							return (
								popnClearTypeToInt[aSc.scoreData.hitMeta.specificClearType] -
								popnClearTypeToInt[bSc.scoreData.hitMeta.specificClearType]
							);
						}

						return aSc.scoreData.lampIndex - bSc.scoreData.lampIndex;
					},
				],
				RatingHeader,
			];
	}
}

const popnClearTypeToInt = {
	failedCircle: 0,
	failedDiamond: 1,
	failedStar: 2,
	easyClear: 3,
	clearCircle: 4,
	clearDiamond: 5,
	clearStar: 6,
	fullComboCircle: 7,
	fullComboDiamond: 8,
	fullComboStar: 9,
	perfect: 10,
} as const;
