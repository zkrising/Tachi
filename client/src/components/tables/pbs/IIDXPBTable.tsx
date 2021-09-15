import useScoreRatingAlg from "components/util/useScoreRatingAlg";
import { nanoid } from "nanoid";
import React, { useState } from "react";
import { PublicUserDocument, ScoreCalculatedDataLookup } from "tachi-common";
import { FormatDifficulty } from "tachi-common/js/utils/util";
import { PBDataset } from "types/tables";
import { IsNullish } from "util/misc";
import { NumericSOV, StrSOV } from "util/sorts";
import { HumanFriendlyStrToGradeIndex, HumanFriendlyStrToLampIndex } from "util/str-to-num";
import { CreateDefaultPBSearchParams } from "util/tables/create-search";
import DeltaCell from "../cells/DeltaCell";
import DifficultyCell from "../cells/DifficultyCell";
import IIDXLampCell from "../cells/IIDXLampCell";
import IndexCell from "../cells/IndexCell";
import IndicatorsCell from "../cells/IndicatorsCell";
import RankingCell from "../cells/RankingCell";
import ScoreCell from "../cells/ScoreCell";
import TimestampCell from "../cells/TimestampCell";
import TitleCell from "../cells/TitleCell";
import DropdownRow from "../components/DropdownRow";
import SelectableRating from "../components/SelectableRating";
import TachiTable, { Header, ZTableTHProps } from "../components/TachiTable";
import { usePBState } from "../components/UseScoreState";
import IIDXPBDropdown from "../dropdowns/IIDXPBDropdown";
import IndicatorHeader from "../headers/IndicatorHeader";

export default function IIDXPBTable({
	dataset,
	indexCol = true,
	showPlaycount = false,
	reqUser,
	alg,
	playtype,
}: {
	dataset: PBDataset<"iidx:SP" | "iidx:DP">;
	indexCol?: boolean;
	showPlaycount?: boolean;
	reqUser: PublicUserDocument;
	alg?: ScoreCalculatedDataLookup["iidx:SP" | "iidx:DP"];
	playtype: "SP" | "DP";
}) {
	const defaultRating = useScoreRatingAlg<"iidx:SP" | "iidx:DP">("iidx", playtype);

	const [rating, setRating] = useState<ScoreCalculatedDataLookup["iidx:SP" | "iidx:DP"]>(
		alg ?? defaultRating
	);

	const headers: Header<PBDataset<"iidx:SP" | "iidx:DP">[0]>[] = [
		[
			"Chart",
			"Ch.",
			NumericSOV(
				x =>
					x.__related.chart.tierlistInfo["kt-NC"]?.value ??
					x.__related.chart.tierlistInfo["kt-HC"]?.value ??
					x.__related.chart.levelNum
			),
		],
		IndicatorHeader,
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
			searchFunctions={CreateDefaultPBSearchParams("iidx", playtype)}
			defaultSortMode={indexCol ? "#" : undefined}
			rowFunction={pb => (
				<Row
					pb={pb}
					key={`${pb.chartID}:${pb.userID}`}
					reqUser={reqUser}
					showPlaycount={showPlaycount}
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
	showPlaycount,
}: {
	pb: PBDataset<"iidx:SP" | "iidx:DP">[0];
	indexCol: boolean;
	reqUser: PublicUserDocument;
	showPlaycount: boolean;
	rating: ScoreCalculatedDataLookup["iidx:SP"];
}) {
	const scoreState = usePBState(pb);

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
		>
			{indexCol && <IndexCell index={pb.__related.index} />}
			<DifficultyCell chart={pb.__related.chart} game={"iidx"} />
			<IndicatorsCell highlight={scoreState.highlight} />
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
			{showPlaycount && <td>{pb.__playcount ?? 0}</td>}
		</DropdownRow>
	);
}
