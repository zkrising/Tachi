import React from "react";
import { PBDataset } from "types/tables";
import { NumericSOV } from "util/sorts";
import { CreateDefaultPBSearchParams } from "util/tables/create-search";
import { GetPBLeadingHeaders } from "util/tables/get-pb-leaders";
import IndexCell from "../cells/IndexCell";
import RankingCell from "../cells/RankingCell";
import TimestampCell from "../cells/TimestampCell";
import DropdownRow from "../components/DropdownRow";
import TachiTable, { Header } from "../components/TachiTable";
import { usePBState } from "../components/UseScoreState";
import GenericPBDropdown from "../dropdowns/GenericPBDropdown";
import WACCACoreCells from "../game-core-cells/WACCACoreCells";
import PBLeadingRows from "./PBLeadingRows";

export default function WACCAPBTable({
	dataset,
	indexCol = true,
	showPlaycount = false,
	showUser = false,
	showChart = true,
	playtype,
}: {
	dataset: PBDataset<"wacca:Single">;
	indexCol?: boolean;
	showPlaycount?: boolean;
	showUser?: boolean;
	showChart?: boolean;
	playtype: "9B";
}) {
	const headers: Header<PBDataset<"wacca:Single">[0]>[] = [
		...GetPBLeadingHeaders(showUser, showChart, [
			"Chart",
			"Chart",
			NumericSOV(x => x.__related.chart.levelNum),
		]),
		["Score", "Score", NumericSOV(x => x.scoreData.percent)],
		["Judgements", "Judgements", NumericSOV(x => x.scoreData.percent)],
		["Lamp", "Lamp", NumericSOV(x => x.scoreData.lampIndex)],
		["Rate", "Rate", NumericSOV(x => x.calculatedData.rate ?? 0)],
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
			searchFunctions={CreateDefaultPBSearchParams("wacca", playtype)}
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
	pb: PBDataset<"wacca:Single">[0];
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
			<WACCACoreCells sc={pb} />
			<RankingCell rankingData={pb.rankingData} />
			<TimestampCell time={pb.timeAchieved} />
			{showPlaycount && <td>{pb.__playcount ?? 0}</td>}
		</DropdownRow>
	);
}
