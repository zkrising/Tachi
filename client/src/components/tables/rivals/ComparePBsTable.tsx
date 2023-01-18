import { NumericSOV, StrSOV } from "util/sorts";
import { CreatePBCompareSearchParams } from "util/tables/create-search";
import React, { useEffect, useState } from "react";
import { Game, GetGamePTConfig, GetScoreMetricConf, Playtype } from "tachi-common";
import { ComparePBsDataset } from "types/tables";
import DifficultyCell from "../cells/DifficultyCell";
import PBCompareCell from "../cells/PBCompareCell";
import TitleCell from "../cells/TitleCell";
import SelectableCompareType from "../components/SelectableCompareType";
import TachiTable, { Header, ZTableTHProps } from "../components/TachiTable";
import ChartHeader from "../headers/ChartHeader";
import ScoreCoreCells from "../game-core-cells/ScoreCoreCells";

export default function ComparePBsTable({
	dataset,
	game,
	playtype,
	baseUser,
	compareUser,
}: {
	dataset: ComparePBsDataset;
	game: Game;
	playtype: Playtype;
	baseUser: string;
	compareUser: string;
}) {
	const gptConfig = GetGamePTConfig(game, playtype);

	const [metric, setMetric] = useState<string>(gptConfig.defaultMetric);

	useEffect(() => {
		setMetric(gptConfig.defaultMetric);
	}, [gptConfig]);

	const headers: Header<ComparePBsDataset[0]>[] = [
		ChartHeader(game, (d) => d.chart),
		["Song", "Song", StrSOV((x) => x.song.title)],
		["", "", () => 1, () => <td colSpan={3}>{baseUser}</td>],
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

				const conf = GetScoreMetricConf(gptConfig, metric);

				if (!conf) {
					return 0; // wut
				}

				if (conf.type === "ENUM") {
					return (
						// @ts-expect-error this will work
						x.base.scoreData.enumIndexes[metric] -
						// @ts-expect-error this will work
						x.compare.scoreData.enumIndexes[metric]
					);
				}

				return (
					// @ts-expect-error this will work
					x.base.scoreData[metric] -
					// @ts-expect-error this will work
					x.compare.scoreData[metric]
				);
			}),
			(thProps: ZTableTHProps) => (
				<SelectableCompareType
					key={metric}
					metric={metric}
					setMetric={(e) => {
						setMetric(e);
						thProps.changeSort("Vs.");
					}}
					gptConfig={gptConfig}
					{...thProps}
				/>
			),
		],
		["", "", () => 1, () => <td colSpan={3}>{compareUser}</td>],
	];

	return (
		<TachiTable
			dataset={dataset}
			headers={headers}
			entryName="Charts"
			defaultReverseSort
			defaultSortMode="Vs."
			searchFunctions={CreatePBCompareSearchParams(game, playtype)}
			rowFunction={(data) => <Row data={data} game={game} metric={metric} />}
		/>
	);
}

function Row({ data, game, metric }: { data: ComparePBsDataset[0]; game: Game; metric: string }) {
	const metricConf = GetScoreMetricConf(GetGamePTConfig(game, data.chart.playtype), metric)!;

	return (
		<tr>
			<DifficultyCell chart={data.chart} game={game} alwaysShort />
			<TitleCell game={game} song={data.song} chart={data.chart} />
			{data.base ? (
				<ScoreCoreCells short score={data.base} game={game} chart={data.chart} />
			) : (
				<td colSpan={3}>Not Played</td>
			)}
			<PBCompareCell
				base={data.base}
				compare={data.compare}
				game={game}
				playtype={data.chart.playtype}
				metricConf={metricConf}
				metric={metric}
			/>
			{data.compare ? (
				<ScoreCoreCells short score={data.compare} game={game} chart={data.chart} />
			) : (
				<td colSpan={3}>Not Played</td>
			)}
		</tr>
	);
}
