import React from "react";
import { COLOUR_SET, Game, GetGamePTConfig, PublicUserDocument } from "tachi-common";
import { FolderDataset } from "types/tables";
import { Playtype } from "types/tachi";
import { ChangeOpacity } from "util/color-opacity";
import { NumericSOV, StrSOV } from "util/sorts";
import { CreateDefaultFolderSearchParams } from "util/tables/create-search";
import DifficultyCell from "../cells/DifficultyCell";
import IndicatorsCell from "../cells/IndicatorsCell";
import LampCell from "../cells/LampCell";
import RankingCell from "../cells/RankingCell";
import RatingCell from "../cells/RatingCell";
import ScoreCell from "../cells/ScoreCell";
import TimestampCell from "../cells/TimestampCell";
import TitleCell from "../cells/TitleCell";
import DropdownRow from "../components/DropdownRow";
import TachiTable, { Header } from "../components/TachiTable";
import { usePBState } from "../components/UseScoreState";
import GenericPBDropdown from "../dropdowns/GenericPBDropdown";
import { FolderIndicatorHeader } from "../headers/IndicatorHeader";

export default function GenericFolderTable({
	dataset,
	reqUser,
	game,
	playtype,
	showScore,
}: {
	dataset: FolderDataset;
	reqUser: PublicUserDocument;
	game: Game;
	playtype: Playtype;
	showScore?: boolean;
}) {
	const gptConfig = GetGamePTConfig(game, playtype);

	const headers: Header<FolderDataset[0]>[] = [
		["Chart", "Chart", NumericSOV(x => x.levelNum)],
		FolderIndicatorHeader,
		["Song", "Song", StrSOV(x => x.__related.song.title)],
		["Score", "Score", NumericSOV(x => x.__related.pb?.scoreData.percent ?? -Infinity)],
		["Lamp", "Lamp", NumericSOV(x => x.__related.pb?.scoreData.lampIndex ?? -Infinity)],
		[
			gptConfig.defaultScoreRatingAlg,
			gptConfig.defaultScoreRatingAlg,
			NumericSOV(
				x => x.__related.pb?.calculatedData[gptConfig.defaultScoreRatingAlg] ?? -Infinity
			),
		],
		[
			"Site Ranking",
			"Site Rank",
			NumericSOV(x => x.__related.pb?.rankingData.rank ?? -Infinity),
		],
		["Last Raised", "Last Raised", NumericSOV(x => x.__related.pb?.timeAchieved ?? -Infinity)],
	];

	return (
		<TachiTable
			dataset={dataset}
			headers={headers}
			entryName="Charts"
			searchFunctions={CreateDefaultFolderSearchParams(game, playtype)}
			rowFunction={data => (
				<Row
					data={data}
					key={data.chartID}
					reqUser={reqUser}
					showScore={showScore}
					game={game}
				/>
			)}
		/>
	);
}

function Row({
	data,
	reqUser,
	showScore,
	game,
}: {
	data: FolderDataset[0];
	reqUser: PublicUserDocument;
	showScore?: boolean;
	game: Game;
}) {
	const score = data.__related.pb;

	if (!score) {
		return (
			<tr>
				<DifficultyCell game={game} chart={data} />
				<IndicatorsCell highlight={false} />
				<TitleCell song={data.__related.song} chart={data} game={game} />
				<td colSpan={5}>Not Played.</td>
			</tr>
		);
	}

	// screw the rules of hooks
	const scoreState = usePBState(score);

	return (
		<DropdownRow
			dropdown={
				<GenericPBDropdown
					chart={data}
					reqUser={reqUser}
					game={game}
					playtype={data.playtype}
					scoreState={scoreState}
				/>
			}
		>
			<DifficultyCell game={game} chart={data} />
			<IndicatorsCell highlight={scoreState.highlight} />
			<TitleCell song={data.__related.song} chart={data} game={game} />
			<ScoreCell score={score} showScore={showScore} />
			<LampCell score={score} />
			<RatingCell score={score} />
			<RankingCell rankingData={score.rankingData} />
			<TimestampCell time={score.timeAchieved} />
		</DropdownRow>
	);
}
