import { FormatGPTScoreRatingName } from "util/misc";
import { NumericSOV } from "util/sorts";
import React from "react";
import {
	Game,
	GetGamePTConfig,
	GPTString,
	PBScoreDocument,
	ScoreRatingAlgorithms,
	ScoreDocument,
	Playtype,
	AnyScoreRatingAlg,
	GetGPTString,
} from "tachi-common";
import { SetState } from "types/react";
import {
	ComparePBsDataset,
	FolderDataset,
	PBDataset,
	RivalChartDataset,
	ScoreDataset,
} from "types/tables";
import { GPT_CLIENT_IMPLEMENTATIONS } from "lib/game-implementations";
import SelectableRating from "../components/SelectableRating";
import { Header, ZTableTHProps } from "../components/TachiTable";

export function GetGPTCoreHeaders<
	Dataset extends FolderDataset | PBDataset | ScoreDataset | RivalChartDataset | ComparePBsDataset
>(
	game: Game,
	playtype: Playtype,
	rating: ScoreRatingAlgorithms[GPTString],
	setRating: SetState<ScoreRatingAlgorithms[GPTString]>,
	kMapToScoreOrPB: (k: Dataset[0]) => PBScoreDocument | ScoreDocument | null
): Header<Dataset[0]>[] {
	const gptConfig = GetGamePTConfig(game, playtype);

	let RatingHeader: Header<Dataset[0]>;

	if (Object.keys(gptConfig.scoreRatingAlgs).length === 1) {
		const alg = Object.keys(gptConfig.scoreRatingAlgs)[0] as AnyScoreRatingAlg;

		RatingHeader = [
			FormatGPTScoreRatingName(game, playtype, alg),
			FormatGPTScoreRatingName(game, playtype, alg),
			NumericSOV((x) => kMapToScoreOrPB(x)?.calculatedData[alg] ?? -Infinity),
		];
	} else {
		RatingHeader = [
			"Rating",
			"Rating",
			NumericSOV((x) => kMapToScoreOrPB(x)?.calculatedData[rating] ?? -Infinity),
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

	const implHeaders = GPT_CLIENT_IMPLEMENTATIONS[GetGPTString(game, playtype)].scoreHeaders;

	const outHeaders: Array<Header<Dataset[0]>> = [];

	for (const header of implHeaders) {
		if (header[2]) {
			// replace the sort function with one that correctly resolves
			// pbs
			outHeaders.push([
				header[0],
				header[1],
				(a, b) => {
					const pbA = kMapToScoreOrPB(a);
					const pbB = kMapToScoreOrPB(b);

					if (!pbA) {
						return -Infinity;
					}
					if (!pbB) {
						return Infinity;
					}

					// typescript is NOT happy with what i've done here
					// LOL, who cares.
					// safety is for chumps
					return (header[2] as any)(pbA, pbB);
				},
			]);
		} else {
			outHeaders.push(header as Header<Dataset[0]>);
		}
	}

	// all games have a rating header after their impl header.
	outHeaders.push(RatingHeader);

	return outHeaders;
}
