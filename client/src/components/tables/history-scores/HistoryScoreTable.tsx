import { NumericSOV } from "util/sorts";
import useScoreRatingAlg from "components/util/useScoreRatingAlg";
import React, { useState } from "react";
import {
	ChartDocument,
	Game,
	GPTString,
	integer,
	ScoreRatingAlgorithms,
	ScoreDocument,
	Playtype,
} from "tachi-common";
import { ScoreDataset } from "types/tables";
import TimestampCell from "../cells/TimestampCell";
import TachiTable from "../components/TachiTable";
import ScoreCoreCells from "../game-core-cells/ScoreCoreCells";
import { GetGPTCoreHeaders } from "../headers/GameHeaders";
import DropdownRow from "../components/DropdownRow";
import { GraphAndJudgementDataComponent } from "../dropdowns/components/DocumentComponent";
import { GPTDropdownSettings } from "../dropdowns/GPTDropdownSettings";
import { EmptyHeader } from "../headers/IndicatorHeader";
import DropdownIndicatorCell from "../cells/DropdownIndicatorCell";

export default function HistoryScoreTable({
	dataset,
	pageLen = 10,
	playtype,
	game,
	chart,
}: {
	dataset: ScoreDocument[];
	pageLen?: integer;
	playtype: Playtype;
	game: Game;
	chart: ChartDocument;
}) {
	const defaultRating = useScoreRatingAlg(game, playtype);

	const [rating, setRating] = useState(defaultRating);

	const headers = GetGPTCoreHeaders<ScoreDataset>(game, playtype, rating, setRating, (k) => k);

	return (
		<TachiTable
			dataset={dataset as ScoreDataset}
			pageLen={pageLen}
			noTopDisplayStr
			entryName="Scores"
			headers={[
				...headers,
				["Timestamp", "Timestamp", NumericSOV((x) => x.timeAchieved ?? 0)],
				EmptyHeader,
			]}
			defaultSortMode="Timestamp"
			defaultReverseSort
			rowFunction={(sc) => (
				<Row chart={chart} key={sc.scoreID} sc={sc} game={game} rating={rating} />
			)}
		/>
	);
}

function Row({
	sc,
	chart,
	rating,
	game,
}: {
	sc: ScoreDocument;
	rating: ScoreRatingAlgorithms[GPTString];
	game: Game;
	chart: ChartDocument;
}) {
	return (
		<DropdownRow
			nested
			dropdown={
				<GraphAndJudgementDataComponent
					chart={chart}
					score={sc}
					{...{ ...GPTDropdownSettings(game, chart.playtype) }}
				/>
			}
		>
			<ScoreCoreCells score={sc} game={game} rating={rating as any} chart={chart} />
			<TimestampCell time={sc.timeAchieved} service={sc.service} />
			<DropdownIndicatorCell />
		</DropdownRow>
	);
}
