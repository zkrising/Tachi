import React, { useState } from "react";
import { FormatDifficulty } from "tachi-common/js/utils/util";
import TitleCell from "../cells/TitleCell";
import TimestampCell from "../cells/TimestampCell";
import { NumericSOV, StrSOV } from "util/sorts";
import { ScoreDataset } from "types/tables";
import { integer, PublicUserDocument, Playtypes } from "tachi-common";
import TachiTable from "../components/TachiTable";
import ScoreCell from "../cells/ScoreCell";
import DeltaCell from "../cells/DeltaCell";
import { HumanFriendlyStrToGradeIndex, HumanFriendlyStrToLampIndex } from "util/str-to-num";
import DropdownRow from "../components/DropdownRow";
import { IsNullish } from "util/misc";
import LampCell from "../cells/LampCell";
import BMSDifficultyCell from "../cells/BMSDifficultyCell";
import { Playtype } from "types/tachi";
import GenericPBDropdown from "../dropdowns/GenericPBDropdown";

export default function BMSScoreTable({
	reqUser,
	dataset,
	pageLen,
	playtype,
}: {
	reqUser: PublicUserDocument;
	dataset: ScoreDataset<"bms:7K" | "bms:14K">;
	pageLen?: integer;
	playtype: Playtypes["bms"];
}) {
	return (
		<TachiTable
			dataset={dataset}
			pageLen={pageLen}
			headers={[
				["Chart", "Ch.", NumericSOV(x => x.__related.chart.levelNum)],
				["Song", "Song", StrSOV(x => x.__related.song.title)],
				["Score", "Score", NumericSOV(x => x.scoreData.percent)],
				["Deltas", "Deltas", NumericSOV(x => x.scoreData.percent)],
				["Lamp", "Lamp", NumericSOV(x => x.scoreData.lampIndex)],
				["Sieglinde", "sgl.", NumericSOV(x => x.calculatedData.sieglinde ?? 0)],

				["Timestamp", "Timestamp", NumericSOV(x => x.timeAchieved ?? 0)],
			]}
			entryName="Scores"
			searchFunctions={{
				artist: x => x.__related.song.artist,
				title: x => x.__related.song.title,
				difficulty: x => FormatDifficulty(x.__related.chart, "bms"),
				level: x => x.__related.chart.levelNum,
				score: x => x.scoreData.score,
				percent: x => x.scoreData.percent,
				lamp: {
					valueGetter: x => [x.scoreData.lamp, x.scoreData.lampIndex],
					strToNum: HumanFriendlyStrToLampIndex("bms", playtype),
				},
				grade: {
					valueGetter: x => [x.scoreData.grade, x.scoreData.gradeIndex],
					strToNum: HumanFriendlyStrToGradeIndex("bms", playtype),
				},
			}}
			rowFunction={sc => (
				<Row playtype={playtype} key={sc.scoreID} sc={sc} reqUser={reqUser} />
			)}
		/>
	);
}

function Row({
	sc,
	reqUser,
	playtype,
}: {
	sc: ScoreDataset<"bms:7K" | "bms:14K">[0];
	reqUser: PublicUserDocument;
	playtype: Playtype;
}) {
	const [highlight, setHighlight] = useState(sc.highlight);
	const [comment, setComment] = useState(sc.comment);

	const scoreState = { highlight, comment, setHighlight, setComment };

	return (
		<DropdownRow
			className={highlight ? "highlighted-row" : ""}
			dropdown={
				<GenericPBDropdown
					chart={sc.__related.chart}
					reqUser={reqUser}
					game="bms"
					playtype={sc.playtype}
					scoreState={scoreState}
				/>
			}
		>
			<BMSDifficultyCell chart={sc.__related.chart} />
			<TitleCell song={sc.__related.song} chart={sc.__related.chart} game="bms" />
			<ScoreCell score={sc} game="bms" playtype={playtype} />
			<DeltaCell
				game="bms"
				playtype={playtype}
				score={sc.scoreData.score}
				percent={sc.scoreData.percent}
				grade={sc.scoreData.grade}
			/>
			<LampCell sc={sc} />
			<td>
				{!IsNullish(sc.calculatedData.sieglinde)
					? sc.calculatedData.sieglinde!.toFixed(2)
					: "N/A"}
			</td>
			<TimestampCell time={sc.timeAchieved} />
		</DropdownRow>
	);
}
