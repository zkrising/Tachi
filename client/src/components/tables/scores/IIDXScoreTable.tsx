import React, { useState } from "react";
import { FormatDifficulty } from "tachi-common/js/utils/util";
import TitleCell from "../cells/TitleCell";
import TimestampCell from "../cells/TimestampCell";
import BPICell from "../cells/BPICell";
import { ChangeOpacity } from "util/color-opacity";
import { NumericSOV, StrSOV } from "util/sorts";
import SelectableRating from "../components/SelectableRating";
import { ScoreDataset } from "types/tables";
import { GetGamePTConfig, ScoreCalculatedDataLookup } from "tachi-common";
import TachiTable, { Header } from "../components/TachiTable";
import DifficultyCell from "../cells/DifficultyCell";
import ScoreCell from "../cells/ScoreCell";
import DeltaCell from "../cells/DeltaCell";
import { HumanFriendlyStrToGradeIndex, HumanFriendlyStrToLampIndex } from "util/str-to-num";
import { nanoid } from "nanoid";

export default function IIDXScoreTable({ dataset }: { dataset: ScoreDataset<"iidx:SP"> }) {
	const gptConfig = GetGamePTConfig<"iidx:SP">("iidx", "SP");

	const [rating, setRating] = useState<ScoreCalculatedDataLookup["iidx:SP"]>(
		gptConfig.defaultScoreRatingAlg
	);

	return (
		<TachiTable
			dataset={dataset}
			headers={[
				["Chart", "Ch.", NumericSOV(x => x.__related.chart.levelNum)],
				["Song", "Song", StrSOV(x => x.__related.song.title)],
				["Score", "Score", NumericSOV(x => x.scoreData.percent)],
				["Deltas", "Deltas", NumericSOV(x => x.scoreData.percent)],
				["Lamp", "Lamp", NumericSOV(x => x.scoreData.lampIndex)],
				[
					"Rating",
					"Rating",
					null,
					() => (
						<SelectableRating<"iidx:SP">
							key={nanoid()}
							game="iidx"
							playtype="SP"
							setRating={setRating}
						/>
					),
				],
				["Timestamp", "Timestamp", NumericSOV(x => x.timeAchieved ?? 0)],
			]}
			entryName="Scores"
			searchFunctions={{
				artist: x => x.__related.song.artist,
				title: x => x.__related.song.title,
				difficulty: x => FormatDifficulty(x.__related.chart, "iidx"),
				level: x => x.__related.chart.levelNum,
				score: x => x.scoreData.score,
				percent: x => x.scoreData.percent,
				lamp: {
					valueGetter: x => [x.scoreData.lamp, x.scoreData.lampIndex],
					strToNum: HumanFriendlyStrToLampIndex("iidx", "SP"),
				},
				grade: {
					valueGetter: x => [x.scoreData.grade, x.scoreData.gradeIndex],
					strToNum: HumanFriendlyStrToGradeIndex("iidx", "SP"),
				},
			}}
			rowFunction={sc => (
				<tr key={sc.chartID}>
					<DifficultyCell chart={sc.__related.chart} game={"iidx"} />
					<TitleCell artist={sc.__related.song.artist} title={sc.__related.song.title} />
					<ScoreCell score={sc} game="iidx" playtype="SP" />
					<DeltaCell
						game="iidx"
						playtype="SP"
						score={sc.scoreData.score}
						percent={sc.scoreData.percent}
						grade={sc.scoreData.grade}
					/>
					<td
						style={{
							backgroundColor: ChangeOpacity(
								gptConfig.lampColours[sc.scoreData.lamp],
								0.2
							),
						}}
					>
						<strong>{sc.scoreData.lamp}</strong>
						<br />
						<small>[BP: {sc.scoreData.hitMeta.bp ?? "No Data"}]</small>
					</td>
					{rating === "BPI" ? (
						<BPICell bpi={sc.calculatedData.BPI} />
					) : (
						<td>
							{sc.calculatedData[rating]
								? sc.calculatedData[rating]!.toFixed(2)
								: "No Data."}
						</td>
					)}
					<TimestampCell time={sc.timeAchieved} />
				</tr>
			)}
		/>
	);
}
