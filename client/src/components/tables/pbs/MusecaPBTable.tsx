import React from "react";
import { PublicUserDocument } from "tachi-common";
import { PBDataset } from "types/tables";
import { NumericSOV, StrSOV } from "util/sorts";
import { CreateDefaultPBSearchParams } from "util/tables/create-search";
import { GetPBLeadingHeaders } from "util/tables/get-pb-leaders";
import DifficultyCell from "../cells/DifficultyCell";
import IndexCell from "../cells/IndexCell";
import IndicatorsCell from "../cells/IndicatorsCell";
import LampCell from "../cells/LampCell";
import MillionsScoreCell from "../cells/MillionsScoreCell";
import MusecaJudgementCell from "../cells/MusecaJudgementCell";
import RankingCell from "../cells/RankingCell";
import RatingCell from "../cells/RatingCell";
import TimestampCell from "../cells/TimestampCell";
import TitleCell from "../cells/TitleCell";
import DropdownRow from "../components/DropdownRow";
import TachiTable, { Header } from "../components/TachiTable";
import { usePBState } from "../components/UseScoreState";
import GenericPBDropdown from "../dropdowns/GenericPBDropdown";
import IndicatorHeader from "../headers/IndicatorHeader";
import PBLeadingRows from "./PBLeadingRows";

export default function MusecaPBTable({
	dataset,
	indexCol = true,
	showPlaycount = false,
	showUser = false,
	showChart = true,
	playtype,
}: {
	dataset: PBDataset<"museca:Single">;
	indexCol?: boolean;
	showPlaycount?: boolean;
	showUser?: boolean;
	showChart?: boolean;
	playtype: "Single";
}) {
	const headers: Header<PBDataset<"museca:Single">[0]>[] = [
		...GetPBLeadingHeaders(showUser, showChart, [
			"Chart",
			"Chart",
			NumericSOV(x => x.__related.chart.levelNum),
		]),
		["Score", "Score", NumericSOV(x => x.scoreData.percent)],
		["Near - Miss", "Nr. Ms.", NumericSOV(x => x.scoreData.percent)],
		["Lamp", "Lamp", NumericSOV(x => x.scoreData.lampIndex)],
		["ktRating", "ktRating", NumericSOV(x => x.calculatedData.ktRating ?? 0)],
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
			searchFunctions={CreateDefaultPBSearchParams("museca", playtype)}
			defaultSortMode={indexCol ? "#" : undefined}
			rowFunction={pb => (
				<Row
					pb={pb}
					key={`${pb.chartID}:${pb.userID}`}
					indexCol={indexCol}
					showPlaycount={showPlaycount}
					showChart={showChart}
					showUser={showUser}
				/>
			)}
		/>
	);
}

function Row({
	pb,
	indexCol,
	showPlaycount,
	showChart,
	showUser,
}: {
	pb: PBDataset<"museca:Single">[0];
	indexCol: boolean;
	showPlaycount: boolean;
	showChart: boolean;
	showUser: boolean;
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
			<PBLeadingRows {...{ showUser, showChart, pb, scoreState }} />
			<MillionsScoreCell score={pb} />
			<MusecaJudgementCell score={pb} />
			<LampCell score={pb} />
			<RatingCell score={pb} />
			<RankingCell rankingData={pb.rankingData} />
			<TimestampCell time={pb.timeAchieved} />
			{showPlaycount && <td>{pb.__playcount ?? 0}</td>}
		</DropdownRow>
	);
}
