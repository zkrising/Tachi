import { NumericSOV, StrSOV } from "util/sorts";
import useScoreRatingAlg from "components/util/useScoreRatingAlg";
import React, { useState } from "react";
import { ChartDocument, Game, IDStrings, ScoreCalculatedDataLookup } from "tachi-common";
import { RivalChartDataset } from "types/tables";
import IndexCell from "../cells/IndexCell";
import RankingCell from "../cells/RankingCell";
import TimestampCell from "../cells/TimestampCell";
import UserCell from "../cells/UserCell";
import DropdownRow from "../components/DropdownRow";
import TachiTable, { Header } from "../components/TachiTable";
import { GraphAndJudgementDataComponent } from "../dropdowns/components/DocumentComponent";
import { GPTDropdownSettings } from "../dropdowns/GPTDropdownSettings";
import ScoreCoreCells from "../game-core-cells/ScoreCoreCells";
import { GetGPTCoreHeaders } from "../headers/GameHeaders";

export default function RivalChartTable<I extends IDStrings = IDStrings>({
	dataset,
	game,
	chart,
}: {
	dataset: RivalChartDataset<I>;
	game: Game;
	chart: ChartDocument;
}) {
	const playtype = chart.playtype;

	const defaultRating = useScoreRatingAlg(game, playtype);

	const [rating, setRating] = useState(defaultRating);

	const headers: Header<RivalChartDataset[0]>[] = [
		["#", "#", NumericSOV((x) => x.__related.index)],
		["User", "User", StrSOV((x) => x.username)],
		...GetGPTCoreHeaders<RivalChartDataset>(
			game,
			playtype,
			rating,
			setRating,
			(x) => x.__related.pb
		),
		[
			"Site Ranking",
			"Site Rank",
			NumericSOV((x) => x.__related.pb?.rankingData.rank ?? -Infinity),
		],
		["Last Raised", "Last Raised", NumericSOV((x) => x.__related.pb?.timeAchieved ?? 0)],
	];

	return (
		<TachiTable
			dataset={dataset}
			headers={headers}
			entryName="Rivals"
			noTopDisplayStr
			defaultSortMode="#"
			rowFunction={(data) => (
				<Row chart={chart} rating={rating} data={data} key={data.id} game={game} />
			)}
		/>
	);
}

function Row<I extends IDStrings = IDStrings>({
	data,
	rating,
	game,
	chart,
}: {
	data: RivalChartDataset<I>[0];
	game: Game;
	rating: ScoreCalculatedDataLookup[I];
	chart: ChartDocument;
}) {
	const pb = data.__related.pb;

	if (!pb) {
		return (
			<tr>
				<td>N/A</td>
				<UserCell user={data} game={game} playtype={chart.playtype} />
				<td colSpan={7}>Not Played.</td>
			</tr>
		);
	}

	return (
		<DropdownRow
			nested
			dropdown={
				<GraphAndJudgementDataComponent
					chart={chart}
					score={data.__related.pb}
					{...{ ...GPTDropdownSettings(game, chart.playtype) }}
				/>
			}
		>
			<IndexCell index={data.__related.index} />
			<UserCell user={data} game={game} playtype={chart.playtype} />
			<ScoreCoreCells score={pb} game={game} rating={rating} chart={chart} />
			<RankingCell rankingData={pb.rankingData} />
			<TimestampCell time={pb.timeAchieved} />
		</DropdownRow>
	);
}
