import React from "react";
import { integer, Playtypes, PublicUserDocument } from "tachi-common";
import { ScoreDataset } from "types/tables";
import { NumericSOV, StrSOV } from "util/sorts";
import { CreateDefaultScoreSearchParams } from "util/tables/create-search";
import DifficultyCell from "../cells/DifficultyCell";
import IndicatorsCell from "../cells/IndicatorsCell";
import TimestampCell from "../cells/TimestampCell";
import TitleCell from "../cells/TitleCell";
import DropdownRow from "../components/DropdownRow";
import TachiTable, { Header } from "../components/TachiTable";
import { useScoreState } from "../components/UseScoreState";
import GenericScoreDropdown from "../dropdowns/GenericScoreDropdown";
import MusecaScoreCoreCells from "../game-core-cells/MusecaScoreCoreCells";
import IndicatorHeader from "../headers/IndicatorHeader";

export default function MusecaScoreTable({
	reqUser,
	dataset,
	pageLen,
}: {
	reqUser: PublicUserDocument;
	dataset: ScoreDataset<"museca:Single">;
	pageLen?: integer;
	playtype: Playtypes["museca"];
}) {
	return (
		<TachiTable
			dataset={dataset}
			pageLen={pageLen}
			headers={
				[
					["Chart", "Chart", NumericSOV(x => x.__related.chart.levelNum)],
					IndicatorHeader,
					["Song", "Song", StrSOV(x => x.__related.song.title)],
					["Score", "Score", NumericSOV(x => x.scoreData.percent)],
					["Near-Miss", "Nr. Ms.", NumericSOV(x => x.scoreData.percent)],
					["Lamp", "Lamp", NumericSOV(x => x.scoreData.lampIndex)],
					["KtRating", "KtRating", NumericSOV(x => x.calculatedData.ktRating ?? 0)],

					["Timestamp", "Timestamp", NumericSOV(x => x.timeAchieved ?? 0)],
				] as Header<ScoreDataset<"museca:Single">[0]>[]
			}
			entryName="Scores"
			searchFunctions={CreateDefaultScoreSearchParams("museca", "Single")}
			rowFunction={sc => <Row key={sc.scoreID} sc={sc} reqUser={reqUser} />}
		/>
	);
}

function Row({
	sc,
	reqUser,
}: {
	sc: ScoreDataset<"museca:Single">[0];
	reqUser: PublicUserDocument;
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
			<DifficultyCell chart={sc.__related.chart} game="museca" />
			<IndicatorsCell highlight={scoreState.highlight} />
			<TitleCell
				song={sc.__related.song}
				comment={sc.comment}
				chart={sc.__related.chart}
				game="museca"
			/>
			<MusecaScoreCoreCells sc={sc} />
			<TimestampCell time={sc.timeAchieved} service={sc.service} />
		</DropdownRow>
	);
}
