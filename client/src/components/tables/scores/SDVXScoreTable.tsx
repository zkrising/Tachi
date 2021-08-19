import React, { useState } from "react";
import { FormatDifficulty } from "tachi-common/js/utils/util";
import TitleCell from "../cells/TitleCell";
import TimestampCell from "../cells/TimestampCell";
import { NumericSOV, StrSOV } from "util/sorts";
import { ScoreDataset } from "types/tables";
import { integer, PublicUserDocument, Playtypes } from "tachi-common";
import TachiTable from "../components/TachiTable";
import DifficultyCell from "../cells/DifficultyCell";
import ScoreCell from "../cells/ScoreCell";
import { HumanFriendlyStrToGradeIndex, HumanFriendlyStrToLampIndex } from "util/str-to-num";
import DropdownRow from "../components/DropdownRow";
import { IsNullish } from "util/misc";
import LampCell from "../cells/LampCell";
import SDVXScoreCell from "../cells/SDVXScoreCell";

export default function SDVXScoreTable({
	reqUser,
	dataset,
	pageLen,
}: {
	reqUser: PublicUserDocument;
	dataset: ScoreDataset<"sdvx:Single">;
	pageLen?: integer;
	playtype: Playtypes["sdvx"];
}) {
	return (
		<TachiTable
			dataset={dataset}
			pageLen={pageLen}
			headers={[
				["Chart", "Ch.", NumericSOV(x => x.__related.chart.levelNum)],
				["Song", "Song", StrSOV(x => x.__related.song.title)],
				["Score", "Score", NumericSOV(x => x.scoreData.percent)],
				["Lamp", "Lamp", NumericSOV(x => x.scoreData.lampIndex)],
				["VF6", "VF6", NumericSOV(x => x.calculatedData.VF6 ?? 0)],

				["Timestamp", "Timestamp", NumericSOV(x => x.timeAchieved ?? 0)],
			]}
			entryName="Scores"
			searchFunctions={{
				artist: x => x.__related.song.artist,
				title: x => x.__related.song.title,
				difficulty: x => FormatDifficulty(x.__related.chart, "sdvx"),
				level: x => x.__related.chart.levelNum,
				score: x => x.scoreData.score,
				percent: x => x.scoreData.percent,
				lamp: {
					valueGetter: x => [x.scoreData.lamp, x.scoreData.lampIndex],
					strToNum: HumanFriendlyStrToLampIndex("sdvx", "Single"),
				},
				grade: {
					valueGetter: x => [x.scoreData.grade, x.scoreData.gradeIndex],
					strToNum: HumanFriendlyStrToGradeIndex("sdvx", "Single"),
				},
			}}
			rowFunction={sc => <Row key={sc.scoreID} sc={sc} reqUser={reqUser} />}
		/>
	);
}

function Row({ sc, reqUser }: { sc: ScoreDataset<"sdvx:Single">[0]; reqUser: PublicUserDocument }) {
	const [highlight, setHighlight] = useState(sc.highlight);
	const [comment, setComment] = useState(sc.comment);

	const scoreState = { highlight, comment, setHighlight, setComment };

	return (
		<DropdownRow
			className={highlight ? "highlighted-row" : ""}
			dropdown={
				<></>
				// <sdvxScoreDropdown
				// 	chart={sc.__related.chart}
				// 	game="sdvx"
				// 	playtype={sc.playtype}
				// 	reqUser={reqUser}
				// 	thisScore={sc}
				// 	scoreState={scoreState}
				// />
			}
		>
			<DifficultyCell chart={sc.__related.chart} game="sdvx" />
			<TitleCell song={sc.__related.song} chart={sc.__related.chart} game="sdvx" />
			<SDVXScoreCell score={sc} />
			<LampCell sc={sc} />
			<td>{!IsNullish(sc.calculatedData.VF6) ? sc.calculatedData.VF6!.toFixed(2) : "N/A"}</td>
			<TimestampCell time={sc.timeAchieved} />
		</DropdownRow>
	);
}
