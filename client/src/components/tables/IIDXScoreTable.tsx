import React, { useState } from "react";
import { useQuery } from "react-query";
import { APIFetchV1 } from "util/api";
import Loading from "components/util/Loading";
import {
	PBScoreDocument,
	SongDocument,
	ChartDocument,
	GetGamePTConfig,
	ScoreCalculatedDataLookup,
} from "tachi-common";
import { FormatDifficulty } from "tachi-common/js/utils/util";
import { Button } from "react-bootstrap";
import { useZTable } from "components/util/table/useZTable";
import TitleCell from "./cells/TitleCell";
import RankingCell from "./cells/RankingCell";
import TimestampCell from "./cells/TimestampCell";
import BPICell from "./cells/BPICell";
import { ChangeOpacity } from "util/color-opacity";
import PageSelector from "./components/PageSelector";
import { PropSort, NumericSOV, StrSOV } from "util/sorts";
import SortableTH from "./components/SortableTH";

type ScoreDataset = (PBScoreDocument<"iidx:SP"> & {
	__related: { chart: ChartDocument<"iidx:SP">; song: SongDocument<"iidx"> };
})[];

export default function IIDXScoreTable() {
	const [search, setSearch] = useState("");
	const [dataset, setDataset] = useState<ScoreDataset>();
	const gptConfig = GetGamePTConfig<"iidx:SP">("iidx", "SP");

	const [rating, setRating] = useState<ScoreCalculatedDataLookup["iidx:SP"]>(
		gptConfig.defaultScoreRatingAlg
	);

	const {
		window,
		setPage,
		pageState,
		incrementPage,
		decrementPage,
		page,
		maxPage,
		displayStr,
		sortMode,
		reverseSort,
		changeSort,
	} = useZTable(dataset ?? [], {
		search,
		searchFunction: (s, pb) => !!pb.__related.song.title.match(new RegExp(s, "ui")),
		entryName: "PBs",
		sortFunctions: {
			Difficulty: NumericSOV(x => x.__related.chart.levelNum),
			Song: StrSOV(x => x.__related.song.title),
			Score: NumericSOV(x => x.scoreData.percent),
			Deltas: NumericSOV(x => x.scoreData.percent),
			Lamp: NumericSOV(x => x.scoreData.lampIndex),
			Ranking: NumericSOV(x => x.rankingData.rank),
			Timestamp: NumericSOV(x => x.timeAchieved ?? 0),
		},
	});

	const { isLoading, error } = useQuery("TEMP_PBS", async () => {
		const res = await APIFetchV1<{
			scores: PBScoreDocument<"iidx:SP">[];
			charts: ChartDocument<"iidx:SP">[];
			songs: SongDocument<"iidx">[];
		}>("/users/me/games/iidx/SP/pbs/best");

		if (!res.success) {
			throw res;
		}

		const songMap = new Map();
		const chartMap = new Map();

		for (const song of res.body.songs) {
			songMap.set(song.id, song);
		}

		for (const chart of res.body.charts) {
			chartMap.set(chart.chartID, chart);
		}

		const data = res.body.scores.map(e => ({
			...e,
			__related: {
				song: songMap.get(e.songID),
				chart: chartMap.get(e.chartID),
			},
		}));

		setDataset(data);
	});

	if (isLoading || !dataset || !window) {
		return <Loading />;
	}

	if (error) {
		return <>An error has occured.</>;
	}

	const thProps = {
		changeSort,
		currentSortMode: sortMode,
		reverseSort,
	};

	return (
		<div className="row d-flex justify-content-center">
			<div className="col-12">
				<input onChange={e => setSearch(e.target.value)} type="text" value={search} />
			</div>
			<div className="col-12 mt-4 mb-4">
				<table className="table table-striped table-hover table-vertical-center text-center">
					<thead>
						<tr>
							<SortableTH name="Difficulty" {...thProps} />
							<SortableTH style={{ width: "300px" }} name="Song" {...thProps} />
							<SortableTH name="Score" {...thProps} />
							<SortableTH name="Deltas" {...thProps} />
							<SortableTH name="Lamp" {...thProps} />
							<th>
								<select
									onChange={v =>
										setRating(
											v.target.value as ScoreCalculatedDataLookup["iidx:SP"]
										)
									}
									style={{
										backgroundColor: "#131313",
										border: "none",
										color: "#ffffff",
										fontSize: "inherit",
										font: "inherit",
									}}
								>
									{gptConfig.scoreRatingAlgs.map(s => (
										<option key={s}>{s}</option>
									))}
								</select>
							</th>
							<SortableTH name="Ranking" {...thProps} />
							<SortableTH name="Timestamp" {...thProps} />
						</tr>
					</thead>
					<tbody>
						{window.map(pb => (
							<tr key={pb.chartID}>
								<td
									style={{
										backgroundColor: ChangeOpacity(
											gptConfig.difficultyColours[
												pb.__related.chart.difficulty
											]!,
											0.2
										),
									}}
								>
									{FormatDifficulty(pb.__related.chart, "iidx")}
								</td>
								<TitleCell
									artist={pb.__related.song.artist}
									title={pb.__related.song.title}
								/>
								<td
									style={{
										backgroundColor: ChangeOpacity(
											gptConfig.gradeColours[pb.scoreData.grade],
											0.2
										),
									}}
								>
									<strong>{pb.scoreData.grade}</strong>
									<br />
									{`${pb.scoreData.percent.toFixed(2)}%`}
									<br />
									<small className="text-muted">[{pb.scoreData.score}]</small>
								</td>
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
						))}
					</tbody>
				</table>
			</div>
			<div className="col-12 d-none d-lg-block">
				<div className="row">
					<div className="col-lg-6">{displayStr}</div>
					<div className="col-lg-6 text-right">
						<div className="btn-group">
							<Button
								variant="secondary"
								disabled={pageState === "start" || pageState === "start-end"}
								onClick={decrementPage}
							>
								Previous
							</Button>
							<PageSelector currentPage={page} maxPage={maxPage} setPage={setPage} />
							<Button
								variant="secondary"
								disabled={pageState === "end" || pageState === "start-end"}
								onClick={incrementPage}
							>
								Next
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
