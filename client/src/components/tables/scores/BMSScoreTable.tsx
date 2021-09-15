import React from "react";
import { integer, Playtypes, PublicUserDocument } from "tachi-common";
import { ScoreDataset } from "types/tables";
import { Playtype } from "types/tachi";
import { NumericSOV, StrSOV } from "util/sorts";
import { CreateDefaultScoreSearchParams } from "util/tables/create-search";
import BMSDifficultyCell from "../cells/BMSDifficultyCell";
import IndicatorsCell from "../cells/IndicatorsCell";
import TimestampCell from "../cells/TimestampCell";
import TitleCell from "../cells/TitleCell";
import DropdownRow from "../components/DropdownRow";
import TachiTable, { Header } from "../components/TachiTable";
import { useScoreState } from "../components/UseScoreState";
import GenericScoreDropdown from "../dropdowns/GenericScoreDropdown";
import BMSScoreCoreCells from "../game-core-cells/BMSScoreCoreCells";
import IndicatorHeader from "../headers/IndicatorHeader";

export default function BMSScoreTable({
	reqUser,
	dataset,
	pageLen,
	playtype,
}: {
	reqUser: PublicUserDocument;
	dataset: ScoreDataset<"bms:7K" | "bms:14K">;
	pageLen?: integer;
	playtype: Playtypes["bms"];
}) {
	return (
		<TachiTable
			dataset={dataset}
			pageLen={pageLen}
			headers={
				[
					[
						"Chart",
						"Ch.",
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
				] as Header<ScoreDataset<"bms:7K" | "bms:14K">[0]>[]
			}
			entryName="Scores"
			searchFunctions={CreateDefaultScoreSearchParams("bms", playtype)}
			rowFunction={sc => (
				<Row playtype={playtype} key={sc.scoreID} sc={sc} reqUser={reqUser} />
			)}
		/>
	);
}

function Row({
	sc,
	reqUser,
	playtype,
}: {
	sc: ScoreDataset<"bms:7K" | "bms:14K">[0];
	reqUser: PublicUserDocument;
	playtype: Playtype;
}) {
	const scoreState = useScoreState(sc);

	return (
		<DropdownRow
			className={scoreState.highlight ? "highlighted-row" : ""}
			dropdown={
				<GenericScoreDropdown
					chart={sc.__related.chart}
					reqUser={reqUser}
					game={sc.game}
					thisScore={sc}
					playtype={sc.playtype}
					scoreState={scoreState}
				/>
			}
		>
			<BMSDifficultyCell chart={sc.__related.chart} />
			<IndicatorsCell highlight={scoreState.highlight} />
			<TitleCell
				song={sc.__related.song}
				chart={sc.__related.chart}
				game="bms"
				comment={sc.comment}
			/>
			<BMSScoreCoreCells sc={sc} />
			<TimestampCell time={sc.timeAchieved} service={sc.scoreMeta.client} />
		</DropdownRow>
	);
}
