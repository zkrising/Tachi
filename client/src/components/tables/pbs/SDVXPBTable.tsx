import React, { useState } from "react";
import TitleCell from "../cells/TitleCell";
import RankingCell from "../cells/RankingCell";
import TimestampCell from "../cells/TimestampCell";
import { NumericSOV, StrSOV } from "util/sorts";
import { PBDataset } from "types/tables";
import { PublicUserDocument } from "tachi-common";
import TachiTable, { Header } from "../components/TachiTable";
import IndexCell from "../cells/IndexCell";
import { HumanFriendlyStrToGradeIndex, HumanFriendlyStrToLampIndex } from "util/str-to-num";
import DropdownRow from "../components/DropdownRow";
import { IsNullish } from "util/misc";
import LampCell from "../cells/LampCell";
import DifficultyCell from "../cells/DifficultyCell";
import SDVXScoreCell from "../cells/SDVXScoreCell";

export default function SDVXPBTable({
	dataset,
	indexCol = true,
	reqUser,
	playtype,
}: {
	dataset: PBDataset<"sdvx:Single">;
	indexCol?: boolean;
	reqUser: PublicUserDocument;
	playtype: "7K" | "14K";
}) {
	const headers: Header<PBDataset<"sdvx:Single">[0]>[] = [
		["Chart", "Ch.", NumericSOV(x => x.__related.chart.levelNum)],
		["Song", "Song", StrSOV(x => x.__related.song.title)],
		["Score", "Score", NumericSOV(x => x.scoreData.percent)],
		["Lamp", "Lamp", NumericSOV(x => x.scoreData.lampIndex)],
		["VF6", "VF6", NumericSOV(x => x.calculatedData.VF6 ?? 0)],
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
					strToNum: HumanFriendlyStrToLampIndex("sdvx", playtype),
				},
				grade: {
					valueGetter: x => [x.scoreData.grade, x.scoreData.gradeIndex],
					strToNum: HumanFriendlyStrToGradeIndex("sdvx", playtype),
				},
			}}
			defaultSortMode={indexCol ? "#" : undefined}
			rowFunction={pb => (
				<Row
					pb={pb}
					key={`${pb.chartID}:${pb.userID}`}
					reqUser={reqUser}
					indexCol={indexCol}
				/>
			)}
		/>
	);
}

function Row({
	pb,
	indexCol,
	reqUser,
}: {
	pb: PBDataset<"sdvx:Single">[0];
	indexCol: boolean;
	reqUser: PublicUserDocument;
}) {
	const [highlight, setHighlight] = useState(pb.highlight);

	const scoreState = { highlight, setHighlight };

	return (
		<DropdownRow
			dropdown={
				<></>
				// <IIDXPBDropdown
				// 	chart={pb.__related.chart}
				// 	reqUser={reqUser}
				// 	game="sdvx"
				// 	playtype={pb.playtype}
				// 	scoreState={scoreState}
				// />
			}
			className={highlight ? "highlighted-row" : ""}
		>
			{indexCol && <IndexCell index={pb.__related.index} />}
			<DifficultyCell game="sdvx" chart={pb.__related.chart} />
			<TitleCell song={pb.__related.song} chart={pb.__related.chart} game="sdvx" />
			<SDVXScoreCell score={pb} />
			<LampCell sc={pb} />
			<td>
				{!IsNullish(pb.calculatedData.VF6) ? pb.calculatedData.VF6!.toFixed(3) : "No Data."}
			</td>
			<RankingCell rankingData={pb.rankingData} />
			<TimestampCell time={pb.timeAchieved} />
		</DropdownRow>
	);
}
