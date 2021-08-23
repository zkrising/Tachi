import React, { useState } from "react";
import { FormatDifficulty } from "tachi-common/js/utils/util";
import TitleCell from "../cells/TitleCell";
import TimestampCell from "../cells/TimestampCell";
import { NumericSOV, StrSOV } from "util/sorts";
import { ScoreDataset } from "types/tables";
import { integer, PublicUserDocument, Playtypes, Game, GetGamePTConfig } from "tachi-common";
import TachiTable from "../components/TachiTable";
import DifficultyCell from "../cells/DifficultyCell";
import ScoreCell from "../cells/ScoreCell";
import { HumanFriendlyStrToGradeIndex, HumanFriendlyStrToLampIndex } from "util/str-to-num";
import DropdownRow from "../components/DropdownRow";
import { IsNullish } from "util/misc";
import LampCell from "../cells/LampCell";
import MillionsScoreCell from "../cells/MillionsScoreCell";
import GenericScoreDropdown from "../dropdowns/GenericScoreDropdown";
import RatingCell from "../cells/RatingCell";
import { Playtype } from "types/tachi";
import { useScoreState } from "../components/UseScoreState";
import GenericScoreCoreCells from "../game-core-cells/GenericScoreCoreCells";
import { CreateDefaultScoreSearch } from "util/tables";

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
			searchFunctions={CreateDefaultScoreSearch(game, playtype)}
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
			<GenericScoreCoreCells sc={sc} showScore={showScore} />
			<TimestampCell time={sc.timeAchieved} service={sc.service} />
		</DropdownRow>
	);
}
