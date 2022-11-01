import { NumericSOV, StrSOV } from "util/sorts";
import React from "react";
import { Game, IDStrings, Playtype } from "tachi-common";
import { ESDCompare } from "tachi-common/lib/esd";
import { ComparePBsDataset } from "types/tables";
import DifficultyCell from "../cells/DifficultyCell";
import TitleCell from "../cells/TitleCell";
import TachiTable, { Header } from "../components/TachiTable";
import ShortScoreCoreCells from "../game-core-cells/ShortScoreCoreCells";
import ChartHeader from "../headers/ChartHeader";

export default function ComparePBsTable<I extends IDStrings = IDStrings>({
	dataset,
	game,
	baseUser,
	compareUser,
}: {
	dataset: ComparePBsDataset<I>;
	game: Game;
	playtype: Playtype;
	baseUser: string;
	compareUser: string;
}) {
	const headers: Header<ComparePBsDataset[0]>[] = [
		// ["#", "#"],
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
					return Infinity;
				}

				if (x.base.scoreData.esd && x.compare.scoreData.esd) {
					return ESDCompare(x.base.scoreData.esd, x.compare.scoreData.esd);
				}

				return x.base.scoreData.percent - x.compare.scoreData.percent;
			}),
		],
		["", "", () => 1, () => <td colSpan={2}>{compareUser}</td>],
	];

	return (
		<TachiTable
			dataset={dataset}
			headers={headers}
			entryName="PBs"
			noTopDisplayStr
			defaultSortMode="#"
			rowFunction={(data) => <Row data={data} game={game} />}
		/>
	);
}

function Row<I extends IDStrings = IDStrings>({
	data,
	game,
}: {
	data: ComparePBsDataset<I>[0];
	game: Game;
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
			<td>some comparison thing here</td>
			{data.compare ? (
				<ShortScoreCoreCells score={data.compare} game={game} chart={data.chart} />
			) : (
				<td colSpan={2}>Not Played</td>
			)}
		</tr>
	);
}
