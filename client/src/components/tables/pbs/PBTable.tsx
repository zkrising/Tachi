import { NumericSOV } from "util/sorts";
import { CreateDefaultPBSearchParams } from "util/tables/create-search";
import { GetPBLeadingHeaders } from "util/tables/get-pb-leaders";
import useScoreRatingAlg from "components/util/useScoreRatingAlg";
import React, { useState } from "react";
import { Game, IDStrings, ScoreCalculatedDataLookup } from "tachi-common";
import { PBDataset } from "types/tables";
import { Playtype } from "types/tachi";
import DropdownIndicatorCell from "../cells/DropdownIndicatorCell";
import IndexCell from "../cells/IndexCell";
import RankingCell, { RankingViewMode } from "../cells/RankingCell";
import TimestampCell from "../cells/TimestampCell";
import DropdownRow from "../components/DropdownRow";
import TachiTable, { Header } from "../components/TachiTable";
import { usePBState } from "../components/UseScoreState";
import PBDropdown from "../dropdowns/PBDropdown";
import ScoreCoreCells from "../game-core-cells/ScoreCoreCells";
import ChartHeader from "../headers/ChartHeader";
import { GetGPTCoreHeaders } from "../headers/GameHeaders";
import { EmptyHeader } from "../headers/IndicatorHeader";
import { CreateRankingHeader } from "../headers/RankingHeader";
import PBLeadingRows from "./PBLeadingRows";

export default function PBTable<I extends IDStrings = IDStrings>({
	dataset,
	game,
	indexCol = true,
	showPlaycount = false,
	showUser = false,
	showChart = true,
	playtype,
	alg,
	defaultRankingViewMode,
}: {
	dataset: PBDataset<I>;
	indexCol?: boolean;
	showPlaycount?: boolean;
	showUser?: boolean;
	showChart?: boolean;
	playtype: Playtype;
	game: Game;
	alg?: ScoreCalculatedDataLookup[I];
	defaultRankingViewMode?: RankingViewMode | null;
}) {
	const defaultRating = useScoreRatingAlg(game, playtype);

	const [rating, setRating] = useState(alg ?? defaultRating);
	const [rankingViewMode, setRankingViewMode] = useState<RankingViewMode>(
		defaultRankingViewMode ?? "global"
	);

	const headers: Header<PBDataset<I>[0]>[] = [
		...GetPBLeadingHeaders(
			showUser,
			showChart,
			ChartHeader(game, (k) => k.__related.chart)
		),
		EmptyHeader,
		...GetGPTCoreHeaders<PBDataset>(game, playtype, rating, setRating, (x) => x),
		CreateRankingHeader(rankingViewMode, setRankingViewMode, (k) => k.rankingData),
		["Last Raised", "Last Raised", NumericSOV((x) => x.timeAchieved ?? 0)],
		EmptyHeader,
	];

	if (showPlaycount) {
		headers.pop();

		// Put this just before the empty header.
		headers.push(["Playcount", "Plays", NumericSOV((x) => x.__playcount ?? 0)]);
		headers.push(EmptyHeader);
	}

	if (indexCol) {
		headers.unshift(["#", "#", NumericSOV((x) => x.__related.index)]);
	}

	return (
		<TachiTable
			dataset={dataset}
			headers={headers}
			entryName="PBs"
			searchFunctions={CreateDefaultPBSearchParams(game, playtype)}
			defaultSortMode={indexCol ? "#" : undefined}
			rowFunction={(pb) => (
				<Row
					pb={pb}
					key={`${pb.chartID}:${pb.userID}`}
					indexCol={indexCol}
					showPlaycount={showPlaycount}
					showChart={showChart}
					showUser={showUser}
					rating={rating}
					game={game}
					playtype={playtype}
					rankingViewMode={rankingViewMode}
				/>
			)}
		/>
	);
}

function Row<I extends IDStrings = IDStrings>({
	pb,
	indexCol,
	showPlaycount,
	showChart,
	showUser,
	game,
	rating,
	rankingViewMode,
}: {
	pb: PBDataset<I>[0];
	indexCol: boolean;
	showPlaycount: boolean;
	showChart: boolean;
	showUser: boolean;
	game: Game;
	playtype: Playtype;
	// ts bug?
	rating: any; // ScoreCalculatedDataLookup[I];
	rankingViewMode: RankingViewMode;
}) {
	const scoreState = usePBState(pb);

	return (
		<DropdownRow
			dropdown={
				<PBDropdown
					chart={pb.__related.chart}
					userID={pb.userID}
					game={pb.game}
					playtype={pb.playtype}
					scoreState={scoreState}
				/>
			}
		>
			{indexCol && <IndexCell index={pb.__related.index} />}
			<PBLeadingRows {...{ showUser, showChart, pb, scoreState }} />
			<ScoreCoreCells score={pb} game={game} rating={rating} chart={pb.__related.chart} />
			<RankingCell
				rankingData={pb.rankingData}
				userID={pb.userID}
				rankingViewMode={rankingViewMode}
			/>
			<TimestampCell time={pb.timeAchieved} />
			{showPlaycount && <td>{pb.__playcount ?? 0}</td>}
			<DropdownIndicatorCell />
		</DropdownRow>
	);
}
