import { NumericSOV, StrSOV } from "util/sorts";
import { CreateDefaultScoreSearchParams } from "util/tables/create-search";
import useScoreRatingAlg from "components/util/useScoreRatingAlg";
import React, { useState } from "react";
import { Game, IDStrings, integer, ScoreCalculatedDataLookup } from "tachi-common";
import { ScoreDataset } from "types/tables";
import { Playtype } from "types/tachi";
import DifficultyCell from "../cells/DifficultyCell";
import IndicatorsCell from "../cells/IndicatorsCell";
import TimestampCell from "../cells/TimestampCell";
import TitleCell from "../cells/TitleCell";
import UserCell from "../cells/UserCell";
import DropdownRow from "../components/DropdownRow";
import TachiTable, { Header } from "../components/TachiTable";
import { useScoreState } from "../components/UseScoreState";
import ScoreDropdown from "../dropdowns/ScoreDropdown";
import ScoreCoreCells from "../game-core-cells/ScoreCoreCells";
import ChartHeader from "../headers/ChartHeader";
import { GetGPTCoreHeaders } from "../headers/GameHeaders";
import IndicatorHeader from "../headers/IndicatorHeader";

export default function ScoreTable<I extends IDStrings = IDStrings>({
	dataset,
	pageLen,
	playtype,
	userCol = false,
	game,
	alg,
}: {
	dataset: ScoreDataset<I>;
	pageLen?: integer;
	playtype: Playtype;
	userCol?: boolean;
	game: Game;
	alg?: ScoreCalculatedDataLookup[I];
}) {
	const defaultRating = useScoreRatingAlg(game, playtype);
	const [rating, setRating] = useState(alg ?? defaultRating);

	const headers: Header<ScoreDataset<I>[0]>[] = [
		ChartHeader<ScoreDataset>(game, playtype, k => k.__related.chart),
		IndicatorHeader,
		["Song", "Song", StrSOV(x => x.__related.song.title)],
		...GetGPTCoreHeaders<ScoreDataset>(game, playtype, rating, setRating, k => k),
		["Timestamp", "Timestamp", NumericSOV(x => x.timeAchieved ?? 0)],
	];

	if (userCol) {
		headers.unshift(["User", "User", StrSOV(x => x.__related.user.username)]);
	}

	return (
		<TachiTable
			dataset={dataset}
			pageLen={pageLen}
			headers={headers}
			entryName="Scores"
			searchFunctions={CreateDefaultScoreSearchParams(game, playtype)}
			rowFunction={sc => (
				<Row
					game={game}
					key={sc.scoreID}
					playtype={playtype}
					sc={sc}
					rating={rating as any}
					userCol={userCol}
				/>
			)}
		/>
	);
}

function Row<I extends IDStrings = IDStrings>({
	sc,
	rating,
	playtype,
	userCol,
	game,
}: {
	sc: ScoreDataset<I>[0];
	rating: ScoreCalculatedDataLookup[I];
	game: Game;
	playtype: Playtype;
	userCol: boolean;
}) {
	const scoreState = useScoreState(sc);

	return (
		<DropdownRow
			dropdown={
				<ScoreDropdown
					chart={sc.__related.chart}
					game={game}
					playtype={playtype}
					user={sc.__related.user}
					thisScore={sc}
					scoreState={scoreState}
				/>
			}
		>
			{userCol && <UserCell game={sc.game} playtype={playtype} user={sc.__related.user} />}
			<DifficultyCell chart={sc.__related.chart} game={game} />
			<IndicatorsCell highlight={scoreState.highlight} />
			<TitleCell
				song={sc.__related.song}
				comment={sc.comment}
				chart={sc.__related.chart}
				game={game}
			/>
			<ScoreCoreCells score={sc} rating={rating} game={game} chart={sc.__related.chart} />
			<TimestampCell time={sc.timeAchieved} service={sc.service} />
		</DropdownRow>
	);
}
