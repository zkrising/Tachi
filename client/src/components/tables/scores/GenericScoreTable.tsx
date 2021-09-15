import React from "react";
import { Game, GetGamePTConfig, integer, PublicUserDocument } from "tachi-common";
import { ScoreDataset } from "types/tables";
import { Playtype } from "types/tachi";
import { NumericSOV, StrSOV } from "util/sorts";
import { CreateDefaultScoreSearchParams } from "util/tables/create-search";
import DifficultyCell from "../cells/DifficultyCell";
import IndicatorsCell from "../cells/IndicatorsCell";
import TimestampCell from "../cells/TimestampCell";
import DropdownRow from "../components/DropdownRow";
import TachiTable from "../components/TachiTable";
import { useScoreState } from "../components/UseScoreState";
import GenericScoreDropdown from "../dropdowns/GenericScoreDropdown";
import GenericScoreCoreCells from "../game-core-cells/GenericScoreCoreCells";
import IndicatorHeader from "../headers/IndicatorHeader";

export default function GenericScoreTable({
	reqUser,
	dataset,
	pageLen,
	playtype,
	showScore,
	game,
}: {
	reqUser: PublicUserDocument;
	dataset: ScoreDataset;
	pageLen?: integer;
	playtype: Playtype;
	game: Game;
	showScore?: boolean;
}) {
	const gptConfig = GetGamePTConfig(game, playtype);

	return (
		<TachiTable
			dataset={dataset}
			pageLen={pageLen}
			headers={[
				["Chart", "Ch.", NumericSOV(x => x.__related.chart.levelNum)],
				IndicatorHeader,
				["Song", "Song", StrSOV(x => x.__related.song.title)],
				["Score", "Score", NumericSOV(x => x.scoreData.percent)],
				["Lamp", "Lamp", NumericSOV(x => x.scoreData.lampIndex)],
				[
					gptConfig.defaultScoreRatingAlg,
					gptConfig.defaultScoreRatingAlg,
					NumericSOV(x => x.calculatedData[gptConfig.defaultScoreRatingAlg] ?? 0),
				],
				["Timestamp", "Timestamp", NumericSOV(x => x.timeAchieved ?? 0)],
			]}
			entryName="Scores"
			searchFunctions={CreateDefaultScoreSearchParams(game, playtype)}
			rowFunction={sc => (
				<Row key={sc.scoreID} sc={sc} reqUser={reqUser} showScore={showScore} />
			)}
		/>
	);
}

function Row({
	sc,
	reqUser,
	showScore,
}: {
	sc: ScoreDataset[0];
	reqUser: PublicUserDocument;
	showScore?: boolean;
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
			<DifficultyCell chart={sc.__related.chart} game={sc.game} />
			<IndicatorsCell highlight={scoreState.highlight} />
			<GenericScoreCoreCells sc={sc} showScore={showScore} />
			<TimestampCell time={sc.timeAchieved} service={sc.service} />
		</DropdownRow>
	);
}
