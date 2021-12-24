import React from "react";
import { Game, GetGamePTConfig, integer, PublicUserDocument } from "tachi-common";
import { ScoreDataset } from "types/tables";
import { Playtype } from "types/tachi";
import { UppercaseFirst } from "util/misc";
import { NumericSOV, StrSOV } from "util/sorts";
import { CreateDefaultScoreSearchParams } from "util/tables/create-search";
import DifficultyCell from "../cells/DifficultyCell";
import IndicatorsCell from "../cells/IndicatorsCell";
import TimestampCell from "../cells/TimestampCell";
import TitleCell from "../cells/TitleCell";
import UserCell from "../cells/UserCell";
import DropdownRow from "../components/DropdownRow";
import TachiTable, { Header } from "../components/TachiTable";
import { useScoreState } from "../components/UseScoreState";
import GenericScoreDropdown from "../dropdowns/GenericScoreDropdown";
import GenericCoreCells from "../game-core-cells/GenericCoreCells";
import IndicatorHeader from "../headers/IndicatorHeader";

export default function GenericScoreTable({
	reqUser,
	dataset,
	pageLen,
	playtype,
	showScore,
	game,
	userCol = false,
}: {
	reqUser: PublicUserDocument;
	dataset: ScoreDataset;
	pageLen?: integer;
	playtype: Playtype;
	game: Game;
	userCol?: boolean;
	showScore?: boolean;
}) {
	const gptConfig = GetGamePTConfig(game, playtype);

	const headers: Header<ScoreDataset[0]>[] = [
		["Chart", "Chart", NumericSOV(x => x.__related.chart.levelNum)],
		IndicatorHeader,
		["Song", "Song", StrSOV(x => x.__related.song.title)],
		["Score", "Score", NumericSOV(x => x.scoreData.percent)],
		["Lamp", "Lamp", NumericSOV(x => x.scoreData.lampIndex)],
		[
			UppercaseFirst(gptConfig.defaultScoreRatingAlg),
			UppercaseFirst(gptConfig.defaultScoreRatingAlg),
			NumericSOV(x => x.calculatedData[gptConfig.defaultScoreRatingAlg] ?? 0),
		],
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
			searchFunctions={CreateDefaultScoreSearchParams(game, playtype)}
			rowFunction={sc => (
				<Row
					key={sc.scoreID}
					sc={sc}
					reqUser={reqUser}
					showScore={showScore}
					userCol={userCol}
				/>
			)}
		/>
	);
}

function Row({
	sc,
	reqUser,
	showScore,
	userCol,
}: {
	sc: ScoreDataset[0];
	reqUser: PublicUserDocument;
	showScore?: boolean;
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
			<DifficultyCell chart={sc.__related.chart} game={sc.game} />
			<IndicatorsCell highlight={scoreState.highlight} />
			<TitleCell
				song={sc.__related.song}
				comment={sc.comment}
				chart={sc.__related.chart}
				game={sc.game}
			/>
			<GenericCoreCells sc={sc} showScore={showScore} />
			<TimestampCell time={sc.timeAchieved} service={sc.service} />
		</DropdownRow>
	);
}
