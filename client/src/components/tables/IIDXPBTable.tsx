import React, { useState } from "react";
import { FormatDifficulty } from "tachi-common/js/utils/util";
import { useZTable } from "components/util/table/useZTable";
import TitleCell from "./cells/TitleCell";
import RankingCell from "./cells/RankingCell";
import TimestampCell from "./cells/TimestampCell";
import BPICell from "./cells/BPICell";
import { ChangeOpacity } from "util/color-opacity";
import { NumericSOV, StrSOV } from "util/sorts";
import SelectableRating from "./components/SelectableRating";
import { PBDataset } from "types/tables";
import { GetGamePTConfig, ScoreCalculatedDataLookup } from "tachi-common";
import TachiTable from "./components/TachiTable";
import DifficultyCell from "./cells/DifficultyCell";
import ScoreCell from "./cells/ScoreCell";
import IndexCell from "./cells/IndexCell";
import { ComposeSearchFunction } from "util/ztable/search";

export default function IIDXPBTable({ dataset }: { dataset: PBDataset<"iidx:SP"> }) {
	const gptConfig = GetGamePTConfig<"iidx:SP">("iidx", "SP");

	const [rating, setRating] = useState<ScoreCalculatedDataLookup["iidx:SP"]>(
		gptConfig.defaultScoreRatingAlg
	);

	return (
		<TachiTable
			dataset={dataset}
			headers={[
				["#", "#", NumericSOV(x => x.__related.index)],
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
							game="iidx"
							playtype="SP"
							setRating={setRating}
						/>
					),
				],
				["Ranking", "Rank", NumericSOV(x => x.rankingData.rank)],
				["Timestamp", "Timestamp", NumericSOV(x => x.timeAchieved ?? 0)],
			]}
			entryName="PBs"
			searchFunction={ComposeSearchFunction({
				artist: x => x.__related.song.artist,
				title: x => x.__related.song.title,
				difficulty: x => FormatDifficulty(x.__related.chart, "iidx"),
				level: x => x.__related.chart.levelNum,
				score: x => x.scoreData.score,
				percent: x => x.scoreData.percent,
				lamp: x => x.scoreData.lamp,
				grade: x => x.scoreData.grade,
			})}
			defaultSortMode="Rating"
			rowFunction={pb => (
				<tr key={pb.chartID}>
					<IndexCell index={pb.__related.index} />
					<DifficultyCell chart={pb.__related.chart} game={"iidx"} />
					<TitleCell artist={pb.__related.song.artist} title={pb.__related.song.title} />
					<ScoreCell pb={pb} game="iidx" playtype="SP" />
					<td>
						<small className="text-muted">AAA-100</small>
						<br />
						<strong>AA+20</strong>
					</td>
					<td
						style={{
							backgroundColor: ChangeOpacity(
								gptConfig.lampColours[pb.scoreData.lamp],
								0.2
							),
						}}
					>
						<strong>{pb.scoreData.lamp}</strong>
						<br />
						<small>[BP: {pb.scoreData.hitMeta.bp ?? "No Data"}]</small>
					</td>
					{rating === "BPI" ? (
						<BPICell bpi={pb.calculatedData.BPI} />
					) : (
						<td>
							{pb.calculatedData[rating]
								? pb.calculatedData[rating]!.toFixed(2)
								: "No Data."}
						</td>
					)}
					<RankingCell rankingData={pb.rankingData} />
					<TimestampCell time={pb.timeAchieved} />
				</tr>
			)}
		/>
	);
}
