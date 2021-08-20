import React, { useState } from "react";
import { FormatDifficulty } from "tachi-common/js/utils/util";
import TitleCell from "../cells/TitleCell";
import RankingCell from "../cells/RankingCell";
import TimestampCell from "../cells/TimestampCell";
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
import IIDXPBDropdown from "../dropdowns/IIDXPBDropdown";
import IIDXLampCell from "../cells/IIDXLampCell";
import { IsNullish } from "util/misc";

export default function IIDXPBTable({
	dataset,
	indexCol = true,
	reqUser,
	playtype,
}: {
	dataset: PBDataset<"iidx:SP" | "iidx:DP">;
	indexCol?: boolean;
	reqUser: PublicUserDocument;
	playtype: "SP" | "DP";
}) {
	const gptConfig = GetGamePTConfig<"iidx:SP" | "iidx:DP">("iidx", playtype);

	const [rating, setRating] = useState<ScoreCalculatedDataLookup["iidx:SP" | "iidx:DP"]>(
		gptConfig.defaultScoreRatingAlg
	);

	const headers: Header<PBDataset<"iidx:SP" | "iidx:DP">[0]>[] = [
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
				<SelectableRating<"iidx:SP" | "iidx:DP">
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
				difficulty: x => FormatDifficulty(x.__related.chart, "iidx"),
				level: x => x.__related.chart.levelNum,
				score: x => x.scoreData.score,
				percent: x => x.scoreData.percent,
				ranking: x => x.rankingData.rank,
				lamp: {
					valueGetter: x => [x.scoreData.lamp, x.scoreData.lampIndex],
					strToNum: HumanFriendlyStrToLampIndex("iidx", playtype),
				},
				grade: {
					valueGetter: x => [x.scoreData.grade, x.scoreData.gradeIndex],
					strToNum: HumanFriendlyStrToGradeIndex("iidx", playtype),
				},
			}}
			defaultSortMode={indexCol ? "#" : undefined}
			rowFunction={pb => (
				<Row
					pb={pb}
					key={`${pb.chartID}:${pb.userID}`}
					reqUser={reqUser}
					indexCol={indexCol}
					rating={rating}
				/>
			)}
		/>
	);
}

function Row({
	pb,
	indexCol,
	reqUser,
	rating,
}: {
	pb: PBDataset<"iidx:SP" | "iidx:DP">[0];
	indexCol: boolean;
	reqUser: PublicUserDocument;
	rating: ScoreCalculatedDataLookup["iidx:SP"];
}) {
	const [highlight, setHighlight] = useState(pb.highlight);

	const scoreState = { highlight, setHighlight };

	return (
		<DropdownRow
			dropdown={
				<IIDXPBDropdown
					chart={pb.__related.chart}
					reqUser={reqUser}
					game="iidx"
					playtype={pb.playtype}
					scoreState={scoreState}
				/>
			}
			className={highlight ? "highlighted-row" : ""}
		>
			{indexCol && <IndexCell index={pb.__related.index} />}
			<DifficultyCell chart={pb.__related.chart} game={"iidx"} />
			<TitleCell song={pb.__related.song} chart={pb.__related.chart} game="iidx" />
			<ScoreCell score={pb} />
			<DeltaCell
				game="iidx"
				playtype={pb.playtype}
				score={pb.scoreData.score}
				percent={pb.scoreData.percent}
				grade={pb.scoreData.grade}
			/>
			<IIDXLampCell sc={pb} />
			<td>
				{!IsNullish(pb.calculatedData[rating])
					? pb.calculatedData[rating]!.toFixed(2)
					: "No Data."}
			</td>
			<RankingCell rankingData={pb.rankingData} />
			<TimestampCell time={pb.timeAchieved} />
		</DropdownRow>
	);
}
