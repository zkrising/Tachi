import React, { useState } from "react";
import TitleCell from "../cells/TitleCell";
import RankingCell from "../cells/RankingCell";
import TimestampCell from "../cells/TimestampCell";
import { NumericSOV, StrSOV } from "util/sorts";
import { PBDataset } from "types/tables";
import { PublicUserDocument, ChartDocument } from "tachi-common";
import TachiTable, { Header } from "../components/TachiTable";
import ScoreCell from "../cells/ScoreCell";
import IndexCell from "../cells/IndexCell";
import DeltaCell from "../cells/DeltaCell";
import { HumanFriendlyStrToGradeIndex, HumanFriendlyStrToLampIndex } from "util/str-to-num";
import DropdownRow from "../components/DropdownRow";
import { FormatBMSTables, IsNullish } from "util/misc";
import LampCell from "../cells/LampCell";
import BMSDifficultyCell from "../cells/BMSDifficultyCell";
import { BMS_TABLES } from "util/constants/bms-tables";
import { ValueGetterOrHybrid } from "util/ztable/search";
import GenericPBDropdown from "../dropdowns/GenericPBDropdown";

function GetBMSTableVal(chart: ChartDocument<"bms:7K" | "bms:14K">, key: string) {
	for (const table of chart.data.tableFolders) {
		if (table.table === key) {
			return Number(table.level);
		}
	}

	return null;
}

export default function BMSPBTable({
	dataset,
	indexCol = true,
	reqUser,
	playtype,
}: {
	dataset: PBDataset<"bms:7K" | "bms:14K">;
	indexCol?: boolean;
	reqUser: PublicUserDocument;
	playtype: "7K" | "14K";
}) {
	const headers: Header<PBDataset<"bms:7K" | "bms:14K">[0]>[] = [
		["Chart", "Ch.", NumericSOV(x => x.__related.chart.levelNum)],
		["Song", "Song", StrSOV(x => x.__related.song.title)],
		["Score", "Score", NumericSOV(x => x.scoreData.percent)],
		["Deltas", "Deltas", NumericSOV(x => x.scoreData.percent)],
		["Lamp", "Lamp", NumericSOV(x => x.scoreData.lampIndex)],
		["Sieglinde", "sgl.", NumericSOV(x => x.calculatedData.sieglinde ?? 0)],
		["Ranking", "Rank", NumericSOV(x => x.rankingData.rank)],
		["Last Raised", "Last Raised", NumericSOV(x => x.timeAchieved ?? 0)],
	];

	if (indexCol) {
		headers.unshift(["#", "#", NumericSOV(x => x.__related.index)]);
	}

	let tableSearchFns: Record<
		string,
		ValueGetterOrHybrid<PBDataset<"bms:7K" | "bms:14K">[0]>
	> = {};
	if (playtype === "7K") {
		tableSearchFns = {
			insane: x => GetBMSTableVal(x.__related.chart, BMS_TABLES.insane),
			overjoy: x => GetBMSTableVal(x.__related.chart, BMS_TABLES.overjoy),
			insane2: x => GetBMSTableVal(x.__related.chart, BMS_TABLES.insane2),
			normal: x => GetBMSTableVal(x.__related.chart, BMS_TABLES.normal),
			normal2: x => GetBMSTableVal(x.__related.chart, BMS_TABLES.normal2),
			st: x => GetBMSTableVal(x.__related.chart, BMS_TABLES.stella),
			sl: x => GetBMSTableVal(x.__related.chart, BMS_TABLES.satellite),
			satellite: x => GetBMSTableVal(x.__related.chart, BMS_TABLES.satellite),
			stella: x => GetBMSTableVal(x.__related.chart, BMS_TABLES.stella),
		};
	} else {
		tableSearchFns = {
			insane: x => GetBMSTableVal(x.__related.chart, BMS_TABLES.dpInsane),
			normal: x => GetBMSTableVal(x.__related.chart, BMS_TABLES.dpNormal),
			sl: x => GetBMSTableVal(x.__related.chart, BMS_TABLES.satellite),
			satellite: x => GetBMSTableVal(x.__related.chart, BMS_TABLES.satellite),
		};
	}

	return (
		<TachiTable
			dataset={dataset}
			headers={headers}
			entryName="PBs"
			searchFunctions={{
				artist: x => x.__related.song.artist,
				title: x => x.__related.song.title,
				difficulty: x => FormatBMSTables(x.__related.chart.data.tableFolders),
				...tableSearchFns,
				score: x => x.scoreData.score,
				percent: x => x.scoreData.percent,
				ranking: x => x.rankingData.rank,
				lamp: {
					valueGetter: x => [x.scoreData.lamp, x.scoreData.lampIndex],
					strToNum: HumanFriendlyStrToLampIndex("bms", playtype),
				},
				grade: {
					valueGetter: x => [x.scoreData.grade, x.scoreData.gradeIndex],
					strToNum: HumanFriendlyStrToGradeIndex("bms", playtype),
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
	pb: PBDataset<"bms:7K" | "bms:14K">[0];
	indexCol: boolean;
	reqUser: PublicUserDocument;
}) {
	const [highlight, setHighlight] = useState(pb.highlight);

	const scoreState = { highlight, setHighlight };

	return (
		<DropdownRow
			dropdown={
				<GenericPBDropdown
					chart={pb.__related.chart}
					reqUser={reqUser}
					game="bms"
					playtype={pb.playtype}
					scoreState={scoreState}
				/>
			}
			className={highlight ? "highlighted-row" : ""}
		>
			{indexCol && <IndexCell index={pb.__related.index} />}
			<BMSDifficultyCell chart={pb.__related.chart} />
			<TitleCell song={pb.__related.song} chart={pb.__related.chart} game="bms" />
			<ScoreCell score={pb} game="bms" playtype={pb.playtype} />
			<DeltaCell
				game="bms"
				playtype={pb.playtype}
				score={pb.scoreData.score}
				percent={pb.scoreData.percent}
				grade={pb.scoreData.grade}
			/>
			<LampCell sc={pb} />
			<td>
				{!IsNullish(pb.calculatedData.sieglinde)
					? pb.calculatedData.sieglinde!.toFixed(2)
					: "N/A"}
			</td>
			<RankingCell rankingData={pb.rankingData} />
			<TimestampCell time={pb.timeAchieved} />
		</DropdownRow>
	);
}
