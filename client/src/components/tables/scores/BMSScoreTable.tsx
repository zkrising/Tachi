import React from "react";
import { integer, Playtypes } from "tachi-common";
import { ScoreDataset } from "types/tables";
import { Playtype } from "types/tachi";
import { NumericSOV, StrSOV } from "util/sorts";
import { CreateDefaultScoreSearchParams } from "util/tables/create-search";
import BMSDifficultyCell from "../cells/BMSDifficultyCell";
import IndicatorsCell from "../cells/IndicatorsCell";
import TimestampCell from "../cells/TimestampCell";
import TitleCell from "../cells/TitleCell";
import UserCell from "../cells/UserCell";
import DropdownRow from "../components/DropdownRow";
import TachiTable, { Header } from "../components/TachiTable";
import { useScoreState } from "../components/UseScoreState";
import GenericScoreDropdown from "../dropdowns/GenericScoreDropdown";
import BMSCoreCells from "../game-core-cells/BMSCoreCells";
import IndicatorHeader from "../headers/IndicatorHeader";

export default function BMSScoreTable({
	dataset,
	pageLen,
	playtype,
	userCol = false,
}: {
	dataset: ScoreDataset<"bms:7K" | "bms:14K">;
	pageLen?: integer;
	playtype: Playtypes["bms"];
	userCol?: boolean;
}) {
	const headers: Header<ScoreDataset<"bms:7K" | "bms:14K">[0]>[] = [
		[
			"Chart",
			"Chart",
			NumericSOV(
				x =>
					x.__related.chart.tierlistInfo["sgl-EC"]?.value ??
					x.__related.chart.tierlistInfo["sgl-HC"]?.value ??
					x.__related.chart.levelNum
			),
		],
		IndicatorHeader,
		["Song", "Song", StrSOV(x => x.__related.song.title)],
		["Score", "Score", NumericSOV(x => x.scoreData.percent)],
		["Deltas", "Deltas", NumericSOV(x => x.scoreData.percent)],
		["Lamp", "Lamp", NumericSOV(x => x.scoreData.lampIndex)],
		["Sieglinde", "sgl.", NumericSOV(x => x.calculatedData.sieglinde ?? 0)],

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
			searchFunctions={CreateDefaultScoreSearchParams("bms", playtype)}
			rowFunction={sc => (
				<Row playtype={playtype} key={sc.scoreID} sc={sc} userCol={userCol} />
			)}
		/>
	);
}

function Row({
	sc,
	userCol,
}: {
	sc: ScoreDataset<"bms:7K" | "bms:14K">[0];
	playtype: Playtype;
	userCol: boolean;
}) {
	const scoreState = useScoreState(sc);

	return (
		<DropdownRow
			dropdown={
				<GenericScoreDropdown
					chart={sc.__related.chart}
					user={sc.__related.user}
					game={sc.game}
					thisScore={sc}
					playtype={sc.playtype}
					scoreState={scoreState}
				/>
			}
		>
			{userCol && <UserCell game={sc.game} playtype={sc.playtype} user={sc.__related.user} />}
			<BMSDifficultyCell chart={sc.__related.chart} />
			<IndicatorsCell highlight={scoreState.highlight} />
			<TitleCell
				song={sc.__related.song}
				chart={sc.__related.chart}
				game="bms"
				comment={sc.comment}
			/>
			<BMSCoreCells sc={sc} />
			<TimestampCell time={sc.timeAchieved} service={sc.scoreMeta.client} />
		</DropdownRow>
	);
}
