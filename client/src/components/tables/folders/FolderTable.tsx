import useScoreRatingAlg from "components/util/useScoreRatingAlg";
import React, { useState } from "react";
import { Game, IDStrings, ScoreCalculatedDataLookup } from "tachi-common";
import { FolderDataset } from "types/tables";
import { Playtype } from "types/tachi";
import { NumericSOV, StrSOV } from "util/sorts";
import { CreateDefaultFolderSearchParams } from "util/tables/create-search";
import DifficultyCell from "../cells/DifficultyCell";
import IndicatorsCell from "../cells/IndicatorsCell";
import RankingCell from "../cells/RankingCell";
import TimestampCell from "../cells/TimestampCell";
import TitleCell from "../cells/TitleCell";
import DropdownRow from "../components/DropdownRow";
import TachiTable, { Header } from "../components/TachiTable";
import { usePBState } from "../components/UseScoreState";
import PBDropdown from "../dropdowns/PBDropdown";
import ScoreCoreCells from "../game-core-cells/ScoreCoreCells";
import ChartHeader from "../headers/ChartHeader";
import { GetGPTCoreHeaders } from "../headers/GameHeaders";
import { FolderIndicatorHeader } from "../headers/IndicatorHeader";

export default function FolderTable<I extends IDStrings = IDStrings>({
	dataset,
	game,
	playtype,
}: {
	dataset: FolderDataset<I>;
	game: Game;
	playtype: Playtype;
}) {
	const defaultRating = useScoreRatingAlg(game, playtype);

	const [rating, setRating] = useState(defaultRating);

	const headers: Header<FolderDataset[0]>[] = [
		ChartHeader<FolderDataset>(game, playtype, k => k),
		FolderIndicatorHeader,
		["Song", "Song", StrSOV(x => x.__related.song.title)],
		...GetGPTCoreHeaders<FolderDataset>(game, playtype, rating, setRating, x => x.__related.pb),
		[
			"Site Ranking",
			"Site Rank",
			NumericSOV(x => x.__related.pb?.rankingData.rank ?? -Infinity),
		],
		["Last Raised", "Last Raised", NumericSOV(x => x.__related.pb?.timeAchieved ?? 0)],
	];

	return (
		<TachiTable
			dataset={dataset}
			headers={headers}
			entryName="Charts"
			searchFunctions={CreateDefaultFolderSearchParams(game, playtype)}
			rowFunction={data => <Row rating={rating} data={data} key={data.chartID} game={game} />}
		/>
	);
}

function Row<I extends IDStrings = IDStrings>({
	data,
	rating,
	game,
}: {
	data: FolderDataset<I>[0];
	game: Game;
	rating: ScoreCalculatedDataLookup[I];
}) {
	const score = data.__related.pb;

	if (!score) {
		return (
			<tr>
				<DifficultyCell chart={data} game={game} />
				<IndicatorsCell highlight={false} />
				<TitleCell song={data.__related.song} chart={data} game={game} />
				<td colSpan={6}>Not Played.</td>
			</tr>
		);
	}

	// screw the rules of hooks
	const scoreState = usePBState(score);

	return (
		<DropdownRow
			dropdown={
				<PBDropdown
					chart={data}
					userID={score.userID}
					game={game}
					playtype={data.playtype}
					scoreState={scoreState}
				/>
			}
		>
			<DifficultyCell chart={data} game={game} />
			<IndicatorsCell highlight={scoreState.highlight} />
			<TitleCell song={data.__related.song} chart={data} game={game} />
			<ScoreCoreCells score={score} game={game} rating={rating} />
			<RankingCell rankingData={score.rankingData} />
			<TimestampCell time={score.timeAchieved} />
		</DropdownRow>
	);
}
