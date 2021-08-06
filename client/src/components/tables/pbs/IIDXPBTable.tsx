import React, { useState } from "react";
import { FormatDifficulty } from "tachi-common/js/utils/util";
import TitleCell from "../cells/TitleCell";
import RankingCell from "../cells/RankingCell";
import TimestampCell from "../cells/TimestampCell";
import { ChangeOpacity } from "util/color-opacity";
import { NumericSOV, StrSOV } from "util/sorts";
import SelectableRating from "../components/SelectableRating";
import { PBDataset } from "types/tables";
import { GetGamePTConfig, PublicUserDocument, ScoreCalculatedDataLookup } from "tachi-common";
import TachiTable, { Header, ZTableTHProps } from "../components/TachiTable";
import DifficultyCell from "../cells/DifficultyCell";
import ScoreCell from "../cells/ScoreCell";
import IndexCell from "../cells/IndexCell";
import DeltaCell from "../cells/DeltaCell";
import { HumanFriendlyStrToGradeIndex, HumanFriendlyStrToLampIndex } from "util/str-to-num";
import { nanoid } from "nanoid";
import DropdownRow from "../components/DropdownRow";
import IIDXPBDropdown from "./dropdowns/IIDXPBDropdown";
import IIDXLampCell from "../cells/IIDXLampCell";

export default function IIDXPBTable({
	dataset,
	indexCol = true,
	reqUser,
}: {
	dataset: PBDataset<"iidx:SP">;
	indexCol?: boolean;
	reqUser: PublicUserDocument;
}) {
	const gptConfig = GetGamePTConfig<"iidx:SP">("iidx", "SP");

	const [rating, setRating] = useState<ScoreCalculatedDataLookup["iidx:SP"]>(
		gptConfig.defaultScoreRatingAlg
	);

	const headers: Header<PBDataset<"iidx:SP">[0]>[] = [
		["Chart", "Ch.", NumericSOV(x => x.__related.chart.levelNum)],
		["Song", "Song", StrSOV(x => x.__related.song.title)],
		["Score", "Score", NumericSOV(x => x.scoreData.percent)],
		["Deltas", "Deltas", NumericSOV(x => x.scoreData.percent)],
		["Lamp", "Lamp", NumericSOV(x => x.scoreData.lampIndex)],
		[
			"Rating",
			"Rating",
			NumericSOV(x => x.calculatedData[rating] ?? 0),
			(thProps: ZTableTHProps) => (
				<SelectableRating<"iidx:SP">
					key={nanoid()}
					game="iidx"
					playtype="SP"
					rating={rating}
					setRating={setRating}
					{...thProps}
				/>
			),
		],
		["Ranking", "Rank", NumericSOV(x => x.rankingData.rank)],
		["Timestamp", "Timestamp", NumericSOV(x => x.timeAchieved ?? 0)],
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
				difficulty: x => FormatDifficulty(x.__related.chart, "iidx"),
				level: x => x.__related.chart.levelNum,
				score: x => x.scoreData.score,
				percent: x => x.scoreData.percent,
				ranking: x => x.rankingData.rank,
				lamp: {
					valueGetter: x => [x.scoreData.lamp, x.scoreData.lampIndex],
					strToNum: HumanFriendlyStrToLampIndex("iidx", "SP"),
				},
				grade: {
					valueGetter: x => [x.scoreData.grade, x.scoreData.gradeIndex],
					strToNum: HumanFriendlyStrToGradeIndex("iidx", "SP"),
				},
			}}
			defaultSortMode={indexCol ? "#" : undefined}
			rowFunction={pb => (
				<DropdownRow
					dropdown={
						<IIDXPBDropdown
							chart={pb.__related.chart}
							reqUser={reqUser}
							game={"iidx"}
							playtype={"SP"}
						/>
					}
					key={pb.chartID}
				>
					{indexCol && <IndexCell index={pb.__related.index} />}
					<DifficultyCell chart={pb.__related.chart} game={"iidx"} />
					<TitleCell song={pb.__related.song} chart={pb.__related.chart} game="iidx" />
					<ScoreCell score={pb} game="iidx" playtype="SP" />
					<DeltaCell
						game="iidx"
						playtype="SP"
						score={pb.scoreData.score}
						percent={pb.scoreData.percent}
						grade={pb.scoreData.grade}
					/>
					<IIDXLampCell sc={pb} />
					<td>
						{pb.calculatedData[rating]
							? pb.calculatedData[rating]!.toFixed(2)
							: "No Data."}
					</td>
					<RankingCell rankingData={pb.rankingData} />
					<TimestampCell time={pb.timeAchieved} />
				</DropdownRow>
			)}
		/>
	);
}
