import useScoreRatingAlg from "components/util/useScoreRatingAlg";
import { UserContext } from "context/UserContext";
import { nanoid } from "nanoid";
import React, { useContext, useState } from "react";
import { PublicUserDocument, ScoreCalculatedDataLookup } from "tachi-common";
import { PBDataset } from "types/tables";
import { IsNullish } from "util/misc";
import { NumericSOV } from "util/sorts";
import { CreateDefaultPBSearchParams } from "util/tables/create-search";
import { GetPBLeadingHeaders } from "util/tables/get-pb-leaders";
import DeltaCell from "../cells/DeltaCell";
import DifficultyCell from "../cells/DifficultyCell";
import IIDXLampCell from "../cells/IIDXLampCell";
import IndexCell from "../cells/IndexCell";
import IndicatorsCell from "../cells/IndicatorsCell";
import RankingCell from "../cells/RankingCell";
import ScoreCell from "../cells/ScoreCell";
import TimestampCell from "../cells/TimestampCell";
import TitleCell from "../cells/TitleCell";
import UserCell from "../cells/UserCell";
import DropdownRow from "../components/DropdownRow";
import SelectableRating from "../components/SelectableRating";
import TachiTable, { Header, ZTableTHProps } from "../components/TachiTable";
import { usePBState } from "../components/UseScoreState";
import IIDXPBDropdown from "../dropdowns/IIDXPBDropdown";
import PBLeadingRows from "./PBLeadingRows";

export default function IIDXPBTable({
	dataset,
	indexCol = true,
	showPlaycount = false,
	showUser = false,
	showChart = true,
	alg,
	playtype,
}: {
	dataset: PBDataset<"iidx:SP" | "iidx:DP">;
	indexCol?: boolean;
	showPlaycount?: boolean;
	showUser?: boolean;
	showChart?: boolean;
	alg?: ScoreCalculatedDataLookup["iidx:SP" | "iidx:DP"];
	playtype: "SP" | "DP";
}) {
	const defaultRating = useScoreRatingAlg<"iidx:SP" | "iidx:DP">("iidx", playtype);

	console.log(alg, defaultRating);

	const [rating, setRating] = useState<ScoreCalculatedDataLookup["iidx:SP" | "iidx:DP"]>(
		alg ?? defaultRating
	);

	const headers: Header<PBDataset<"iidx:SP" | "iidx:DP">[0]>[] = [
		...GetPBLeadingHeaders(showUser, showChart, [
			"Chart",
			"Chart",
			NumericSOV(
				x =>
					x.__related.chart.tierlistInfo["kt-NC"]?.value ??
					x.__related.chart.tierlistInfo["kt-HC"]?.value ??
					x.__related.chart.levelNum
			),
		]),
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
					playtype={playtype}
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

	// if (hideRankingCell) {

	// }

	if (indexCol) {
		headers.unshift(["#", "#", NumericSOV(x => x.__related.index)]);
	}

	const { user } = useContext(UserContext);

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
					showPlaycount={showPlaycount}
					indexCol={indexCol}
					rating={rating}
					showUser={showUser}
					showChart={showChart}
					user={user}
				/>
			)}
		/>
	);
}

function Row({
	pb,
	indexCol,
	rating,
	showPlaycount,
	showChart,
	showUser,
	user,
}: {
	pb: PBDataset<"iidx:SP" | "iidx:DP">[0];
	indexCol: boolean;
	showPlaycount: boolean;
	showUser: boolean;
	showChart: boolean;
	rating: ScoreCalculatedDataLookup["iidx:SP"];
	user: PublicUserDocument | null;
}) {
	const scoreState = usePBState(pb);

	return (
		<DropdownRow
			// className={pb.userID === user?.id ? "highlighted-row" : ""}
			dropdown={
				<IIDXPBDropdown
					chart={pb.__related.chart}
					userID={pb.userID}
					game="iidx"
					playtype={pb.playtype}
					scoreState={scoreState}
				/>
			}
		>
			{indexCol && <IndexCell index={pb.__related.index} />}
			<PBLeadingRows {...{ showUser, showChart, pb, scoreState }} />
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
