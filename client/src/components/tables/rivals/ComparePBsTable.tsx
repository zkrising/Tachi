import { NumericSOV, StrSOV } from "util/sorts";
import React, { useState } from "react";
import { Game, IDStrings, Playtype } from "tachi-common";
import { ESDCompare } from "tachi-common/lib/esd";
import { ComparePBsDataset } from "types/tables";
import DifficultyCell from "../cells/DifficultyCell";
import TitleCell from "../cells/TitleCell";
import TachiTable, { Header, ZTableTHProps } from "../components/TachiTable";
import ShortScoreCoreCells from "../game-core-cells/ShortScoreCoreCells";
import ChartHeader from "../headers/ChartHeader";
import PBCompareCell from "../cells/PBCompareCell";
import SelectableCompareType from "../components/SelectableCompareType";

export default function ComparePBsTable<I extends IDStrings = IDStrings>({
	dataset,
	game,
	baseUser,
	compareUser,
	shouldESD,
}: {
	dataset: ComparePBsDataset<I>;
	game: Game;
	playtype: Playtype;
	baseUser: string;
	compareUser: string;
	shouldESD: boolean;
}) {
	const [compareType, setCompareType] = useState<"score" | "lamp">("score");

	const headers: Header<ComparePBsDataset[0]>[] = [
		ChartHeader(game, (d) => d.chart),
		["Song", "Song", StrSOV((x) => x.song.title)],
		["", "", () => 1, () => <td colSpan={2}>{baseUser}</td>],
		[
			"Vs.",
			"Vs.",
			NumericSOV((x) => {
				if (!x.base) {
					return -Infinity;
				}

				if (!x.compare) {
					return -Infinity;
				}

				if (compareType === "score") {
					if (shouldESD && x.base.scoreData.esd && x.compare.scoreData.esd) {
						// esd is inverted, whoops
						const e = ESDCompare(x.compare.scoreData.esd, x.base.scoreData.esd);

						if (e !== 0) {
							return e;
						}
					}

					return x.base.scoreData.percent - x.compare.scoreData.percent;
				}

				return x.base.scoreData.lampIndex - x.compare.scoreData.lampIndex;
			}),
			(thProps: ZTableTHProps) => (
				<SelectableCompareType
					key={compareType}
					compareType={compareType}
					setCompareType={setCompareType}
					{...thProps}
				/>
			),
		],
		["", "", () => 1, () => <td colSpan={2}>{compareUser}</td>],
	];

	return (
		<TachiTable
			// very funny way of getting the table to re-render when shouldESD is changed
			key={`${shouldESD}`}
			dataset={dataset}
			headers={headers}
			entryName="Charts"
			defaultReverseSort
			defaultSortMode="Vs."
			rowFunction={(data) => (
				<Row data={data} game={game} compareType={compareType} shouldESD={shouldESD} />
			)}
		/>
	);
}

function Row<I extends IDStrings = IDStrings>({
	data,
	game,
	compareType,
	shouldESD,
}: {
	data: ComparePBsDataset<I>[0];
	game: Game;
	compareType: "score" | "lamp";
	shouldESD: boolean;
}) {
	return (
		<tr>
			<DifficultyCell chart={data.chart} game={game} alwaysShort />
			<TitleCell game={game} song={data.song} chart={data.chart} />
			{data.base ? (
				<ShortScoreCoreCells score={data.base} game={game} chart={data.chart} />
			) : (
				<td colSpan={2}>Not Played</td>
			)}
			<PBCompareCell
				shouldESD={shouldESD}
				base={data.base}
				compare={data.compare}
				game={game}
				playtype={data.chart.playtype}
				compareType={compareType}
			/>
			{data.compare ? (
				<ShortScoreCoreCells score={data.compare} game={game} chart={data.chart} />
			) : (
				<td colSpan={2}>Not Played</td>
			)}
		</tr>
	);
}
