import React, { useState } from "react";
import TitleCell from "../cells/TitleCell";
import RankingCell from "../cells/RankingCell";
import TimestampCell from "../cells/TimestampCell";
import { NumericSOV, StrSOV } from "util/sorts";
import { PBDataset } from "types/tables";
import { Game, GetGamePTConfig, PublicUserDocument } from "tachi-common";
import TachiTable, { Header } from "../components/TachiTable";
import IndexCell from "../cells/IndexCell";
import { HumanFriendlyStrToGradeIndex, HumanFriendlyStrToLampIndex } from "util/str-to-num";
import DropdownRow from "../components/DropdownRow";
import { IsNullish } from "util/misc";
import LampCell from "../cells/LampCell";
import DifficultyCell from "../cells/DifficultyCell";
import MillionsScoreCell from "../cells/MillionsScoreCell";
import GenericPBDropdown from "../dropdowns/GenericPBDropdown";
import SDVXJudgementCell from "../cells/SDVXJudgementCell";
import ScoreCell from "../cells/ScoreCell";
import RatingCell from "../cells/RatingCell";
import { Playtype } from "types/tachi";

export default function GenericPBTable({
	dataset,
	indexCol = true,
	reqUser,
	game,
	playtype,
	showScore,
}: {
	dataset: PBDataset;
	indexCol?: boolean;
	reqUser: PublicUserDocument;
	game: Game;
	playtype: Playtype;
	showScore?: boolean;
}) {
	const gptConfig = GetGamePTConfig(game, playtype);

	const headers: Header<PBDataset[0]>[] = [
		["Chart", "Ch.", NumericSOV(x => x.__related.chart.levelNum)],
		["Song", "Song", StrSOV(x => x.__related.song.title)],
		["Score", "Score", NumericSOV(x => x.scoreData.percent)],
		["Lamp", "Lamp", NumericSOV(x => x.scoreData.lampIndex)],
		[
			gptConfig.defaultScoreRatingAlg,
			gptConfig.defaultScoreRatingAlg,
			NumericSOV(x => x.calculatedData[gptConfig.defaultScoreRatingAlg] ?? 0),
		],
		["Ranking", "Rank", NumericSOV(x => x.rankingData.rank)],
		["Last Raised", "Last Raised", NumericSOV(x => x.timeAchieved ?? 0)],
	];

	if (indexCol) {
		headers.unshift(["#", "#", NumericSOV(x => x.__related.index)]);
	}

	return (
		<TachiTable
			dataset={dataset}
			headers={headers}
			entryName="PBs"
			searchFunctions={{
				artist: x => x.__related.song.artist,
				title: x => x.__related.song.title,
				difficulty: x => x.__related.chart.difficulty,
				level: x => x.__related.chart.levelNum,
				score: x => x.scoreData.score,
				percent: x => x.scoreData.percent,
				ranking: x => x.rankingData.rank,
				lamp: {
					valueGetter: x => [x.scoreData.lamp, x.scoreData.lampIndex],
					strToNum: HumanFriendlyStrToLampIndex(game, playtype),
				},
				grade: {
					valueGetter: x => [x.scoreData.grade, x.scoreData.gradeIndex],
					strToNum: HumanFriendlyStrToGradeIndex(game, playtype),
				},
			}}
			defaultSortMode={indexCol ? "#" : undefined}
			rowFunction={pb => (
				<Row
					pb={pb}
					key={`${pb.chartID}:${pb.userID}`}
					reqUser={reqUser}
					indexCol={indexCol}
					showScore={showScore}
				/>
			)}
		/>
	);
}

function Row({
	pb,
	indexCol,
	reqUser,
	showScore,
}: {
	pb: PBDataset[0];
	indexCol: boolean;
	reqUser: PublicUserDocument;
	showScore?: boolean;
}) {
	const [highlight, setHighlight] = useState(pb.highlight);

	const scoreState = { highlight, setHighlight };

	return (
		<DropdownRow
			dropdown={
				<GenericPBDropdown
					chart={pb.__related.chart}
					reqUser={reqUser}
					game={pb.game}
					playtype={pb.playtype}
					scoreState={scoreState}
				/>
			}
			className={highlight ? "highlighted-row" : ""}
		>
			{indexCol && <IndexCell index={pb.__related.index} />}
			<DifficultyCell game={pb.game} chart={pb.__related.chart} />
			<TitleCell song={pb.__related.song} chart={pb.__related.chart} game={pb.game} />
			<ScoreCell score={pb} showScore={showScore} />
			<LampCell score={pb} />
			<RatingCell score={pb} />
			<RankingCell rankingData={pb.rankingData} />
			<TimestampCell time={pb.timeAchieved} />
		</DropdownRow>
	);
}
