import { NumericSOV, StrSOV } from "util/sorts";
import { CreateDefaultFolderSearchParams } from "util/tables/create-search";
import Muted from "components/util/Muted";
import usePreferredRanking from "components/util/usePreferredRanking";
import useScoreRatingAlg from "components/util/useScoreRatingAlg";
import React, { useState } from "react";
import { Game, IDStrings, ScoreCalculatedDataLookup, Playtype } from "tachi-common";
import { FolderDataset } from "types/tables";
import DifficultyCell from "../cells/DifficultyCell";
import IndicatorsCell from "../cells/IndicatorsCell";
import RankingCell, { RankingViewMode } from "../cells/RankingCell";
import TimestampCell from "../cells/TimestampCell";
import TitleCell from "../cells/TitleCell";
import DropdownRow from "../components/DropdownRow";
import TachiTable, { Header } from "../components/TachiTable";
import { usePBState } from "../components/UseScoreState";
import PBDropdown from "../dropdowns/PBDropdown";
import ScoreCoreCells from "../game-core-cells/ScoreCoreCells";
import ChartHeader from "../headers/ChartHeader";
import { GetGPTCoreHeaders } from "../headers/GameHeaders";
import { EmptyHeader, FolderIndicatorHeader } from "../headers/IndicatorHeader";
import { CreateRankingHeader } from "../headers/RankingHeader";

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

	const preferredRanking = usePreferredRanking();

	const [rating, setRating] = useState(defaultRating);
	const [rankingViewMode, setRankingViewMode] = useState<RankingViewMode>(
		preferredRanking ?? "global"
	);

	const headers: Header<FolderDataset[0]>[] = [
		ChartHeader(game, (k) => k),
		FolderIndicatorHeader,
		["Song", "Song", StrSOV((x) => x.__related.song.title)],
		EmptyHeader,
		...GetGPTCoreHeaders<FolderDataset>(
			game,
			playtype,
			rating,
			setRating,
			(x) => x.__related.pb
		),
		CreateRankingHeader(
			rankingViewMode,
			setRankingViewMode,
			(k) => k.__related.pb?.rankingData
		),
		["Last Raised", "Last Raised", NumericSOV((x) => x.__related.pb?.timeAchieved ?? 0)],
	];

	return (
		<TachiTable
			dataset={dataset}
			headers={headers}
			entryName="Charts"
			searchFunctions={CreateDefaultFolderSearchParams(game, playtype)}
			rowFunction={(data) => (
				<Row
					rating={rating}
					data={data}
					key={data.chartID}
					game={game}
					rankingViewMode={rankingViewMode}
				/>
			)}
		/>
	);
}

function Row<I extends IDStrings = IDStrings>({
	data,
	rating,
	game,
	rankingViewMode,
}: {
	data: FolderDataset<I>[0];
	game: Game;
	rating: ScoreCalculatedDataLookup[I];
	rankingViewMode: RankingViewMode;
}) {
	const score = data.__related.pb;

	if (!score) {
		return (
			<tr>
				<DifficultyCell chart={data} game={game} />
				<IndicatorsCell highlight={false} />
				<TitleCell song={data.__related.song} chart={data} game={game} />
				<td colSpan={7}>Not Played.</td>
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
			<td>
				<Muted>PB</Muted>
			</td>
			<ScoreCoreCells score={score} game={game} rating={rating} chart={data} />
			<RankingCell
				rankingData={score.rankingData}
				userID={score.userID}
				rankingViewMode={rankingViewMode}
			/>
			<TimestampCell time={score.timeAchieved} />
		</DropdownRow>
	);
}
