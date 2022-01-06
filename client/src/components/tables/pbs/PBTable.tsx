import useScoreRatingAlg from "components/util/useScoreRatingAlg";
import React, { useState } from "react";
import { Game, IDStrings, ScoreCalculatedDataLookup } from "tachi-common";
import { PBDataset } from "types/tables";
import { Playtype } from "types/tachi";
import { NumericSOV } from "util/sorts";
import { CreateDefaultPBSearchParams } from "util/tables/create-search";
import { GetPBLeadingHeaders } from "util/tables/get-pb-leaders";
import IndexCell from "../cells/IndexCell";
import RankingCell from "../cells/RankingCell";
import TimestampCell from "../cells/TimestampCell";
import DropdownRow from "../components/DropdownRow";
import TachiTable, { Header } from "../components/TachiTable";
import { usePBState } from "../components/UseScoreState";
import PBDropdown from "../dropdowns/PBDropdown";
import ScoreCoreCells from "../game-core-cells/ScoreCoreCells";
import ChartHeader from "../headers/ChartHeader";
import { GetGPTCoreHeaders } from "../headers/GameHeaders";
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
}: {
	dataset: PBDataset<I>;
	indexCol?: boolean;
	showPlaycount?: boolean;
	showUser?: boolean;
	showChart?: boolean;
	playtype: Playtype;
	game: Game;
	alg?: ScoreCalculatedDataLookup[I];
}) {
	const defaultRating = useScoreRatingAlg(game, playtype);

	const [rating, setRating] = useState(alg ?? defaultRating);

	const headers: Header<PBDataset<I>[0]>[] = [
		...GetPBLeadingHeaders(
			showUser,
			showChart,
			ChartHeader<PBDataset>(game, playtype, k => k.__related.chart)
		),
		...GetGPTCoreHeaders<PBDataset>(game, playtype, rating, setRating, x => x),
		["Site Ranking", "Site Rank", NumericSOV(x => x.rankingData.rank)],
		["Last Raised", "Last Raised", NumericSOV(x => x.timeAchieved ?? 0)],
	];

	if (showPlaycount) {
		headers.push(["Playcount", "Plays", NumericSOV(x => x.__playcount ?? 0)]);
	}

	if (indexCol) {
		headers.unshift(["#", "#", NumericSOV(x => x.__related.index)]);
	}

	return (
		<TachiTable
			dataset={dataset}
			headers={headers}
			entryName="PBs"
			searchFunctions={CreateDefaultPBSearchParams(game, playtype)}
			defaultSortMode={indexCol ? "#" : undefined}
			rowFunction={pb => (
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
			<ScoreCoreCells score={pb} game={game} rating={rating} />
			<RankingCell rankingData={pb.rankingData} />
			<TimestampCell time={pb.timeAchieved} />
			{showPlaycount && <td>{pb.__playcount ?? 0}</td>}
		</DropdownRow>
	);
}
