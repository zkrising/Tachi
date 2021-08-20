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
			searchFunctions={{
				artist: x => x.__related.song.artist,
				title: x => x.__related.song.title,
				difficulty: x => FormatDifficulty(x.__related.chart, game),
				level: x => x.__related.chart.levelNum,
				score: x => x.scoreData.score,
				percent: x => x.scoreData.percent,
				lamp: {
					valueGetter: x => [x.scoreData.lamp, x.scoreData.lampIndex],
					strToNum: HumanFriendlyStrToLampIndex(game, playtype),
				},
				grade: {
					valueGetter: x => [x.scoreData.grade, x.scoreData.gradeIndex],
					strToNum: HumanFriendlyStrToGradeIndex(game, playtype),
				},
			}}
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
	const [highlight, setHighlight] = useState(sc.highlight);
	const [comment, setComment] = useState(sc.comment);

	const scoreState = { highlight, comment, setHighlight, setComment };

	return (
		<DropdownRow
			className={highlight ? "highlighted-row" : ""}
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
			<TitleCell song={sc.__related.song} chart={sc.__related.chart} game={sc.game} />
			<ScoreCell score={sc} showScore={showScore} />
			<LampCell score={sc} />
			<RatingCell score={sc} />
			<TimestampCell time={sc.timeAchieved} />
		</DropdownRow>
	);
}
