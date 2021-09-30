import React from "react";
import { Game, GetGamePTConfig, PublicUserDocument } from "tachi-common";
import { PBDataset } from "types/tables";
import { Playtype } from "types/tachi";
import { NumericSOV, StrSOV } from "util/sorts";
import { HumanFriendlyStrToGradeIndex, HumanFriendlyStrToLampIndex } from "util/str-to-num";
import { CreateDefaultPBSearchParams } from "util/tables/create-search";
import { GetPBLeadingHeaders } from "util/tables/get-pb-leaders";
import DifficultyCell from "../cells/DifficultyCell";
import IndexCell from "../cells/IndexCell";
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
import IndicatorHeader from "../headers/IndicatorHeader";
import PBLeadingRows from "./PBLeadingRows";

export default function GenericPBTable({
	dataset,
	indexCol = true,
	showPlaycount = false,
	game,
	playtype,
	showScore,
	showUser = false,
	showChart = true,
}: {
	dataset: PBDataset;
	indexCol?: boolean;
	showPlaycount?: boolean;
	game: Game;
	playtype: Playtype;
	showScore?: boolean;
	showUser?: boolean;
	showChart?: boolean;
}) {
	const gptConfig = GetGamePTConfig(game, playtype);

	const headers: Header<PBDataset[0]>[] = [
		...GetPBLeadingHeaders(showUser, showChart, [
			"Chart",
			"Chart",
			NumericSOV(x => x.__related.chart.levelNum),
		]),
		["Score", "Score", NumericSOV(x => x.scoreData.percent)],
		["Lamp", "Lamp", NumericSOV(x => x.scoreData.lampIndex)],
		[
			gptConfig.defaultScoreRatingAlg,
			gptConfig.defaultScoreRatingAlg,
			NumericSOV(x => x.calculatedData[gptConfig.defaultScoreRatingAlg] ?? -Infinity),
		],
		["Site Ranking", "Site Rank", NumericSOV(x => x.rankingData.rank)],
		["Last Raised", "Last Raised", NumericSOV(x => x.timeAchieved ?? 0)],
	];

	if (showPlaycount) {
		headers.push(["Playcount", "Plays", NumericSOV(x => x.__playcount ?? 0)]);
	}

	if (indexCol) {
		headers.unshift(["#", "#", NumericSOV(x => x.__related.index)]);
	}

	return (
		<TachiTable
			dataset={dataset}
			headers={headers}
			entryName="PBs"
			searchFunctions={CreateDefaultPBSearchParams(game, playtype)}
			defaultSortMode={indexCol ? "#" : undefined}
			rowFunction={pb => (
				<Row
					pb={pb}
					key={`${pb.chartID}:${pb.userID}`}
					indexCol={indexCol}
					showScore={showScore}
					showPlaycount={showPlaycount}
					showUser={showUser}
					showChart={showChart}
				/>
			)}
		/>
	);
}

function Row({
	pb,
	indexCol,
	showScore,
	showPlaycount,
	showUser,
	showChart,
}: {
	pb: PBDataset[0];
	indexCol: boolean;
	showPlaycount: boolean;
	showScore?: boolean;
	showUser: boolean;
	showChart: boolean;
}) {
	const scoreState = usePBState(pb);

	return (
		<DropdownRow
			dropdown={
				<GenericPBDropdown
					chart={pb.__related.chart}
					userID={pb.userID}
					game={pb.game}
					playtype={pb.playtype}
					scoreState={scoreState}
				/>
			}
		>
			{indexCol && <IndexCell index={pb.__related.index} />}
			<PBLeadingRows
				pb={pb}
				scoreState={scoreState}
				showChart={showChart}
				showUser={showUser}
			/>
			<ScoreCell score={pb} showScore={showScore} />
			<LampCell score={pb} />
			<RatingCell score={pb} />
			<RankingCell rankingData={pb.rankingData} />
			<TimestampCell time={pb.timeAchieved} />
			{showPlaycount && <td>{pb.__playcount ?? 0}</td>}
		</DropdownRow>
	);
}
