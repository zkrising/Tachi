import { CreateChartLink, CreateChartMap } from "util/data";
import { NumericSOV } from "util/sorts";
import { FormatMillions } from "util/misc";
import { ChangeOpacity } from "util/color-opacity";
import Card from "components/layout/page/Card";
import ApiError from "components/util/ApiError";
import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import React from "react";
import { Col, Row } from "react-bootstrap";
import {
	AnyScoreRatingAlg,
	ChartDocument,
	COLOUR_SET,
	CreateSongMap,
	FmtNum,
	Game,
	GPTString,
	integer,
	PBScoreDocument,
	Playtype,
	SongDocument,
} from "tachi-common";
import { UGPT } from "types/react";
import { PBDataset } from "types/tables";
import { GPTUtility } from "types/ugpt";
import DifficultyCell from "components/tables/cells/DifficultyCell";
import TachiTable from "components/tables/components/TachiTable";
import GentleLink from "components/util/GentleLink";
import Divider from "components/util/Divider";
import { StarField } from "components/tables/cells/OngekiPlatinumCell";

function ComponentClassic({ game, playtype, reqUser }: UGPT) {
	if (game !== "ongeki" || playtype !== "Single") {
		return <></>;
	}
	const { data, error } = useApiQuery<{
		pbs: Array<PBScoreDocument<"ongeki:Single">>;
		songs: Array<SongDocument<"ongeki">>;
		charts: Array<ChartDocument<"ongeki:Single">>;
	}>(`/users/${reqUser.id}/games/${game}/${playtype}/pbs/best?alg=rating`);

	if (error) {
		return <ApiError error={error} />;
	}

	if (!data) {
		return <Loading />;
	}

	const flatDataset: PBDataset<"ongeki:Single"> = CreateFlatDataset(data, "rating", 45);
	const compoundDataset = ColumnMerge<"ongeki:Single">(flatDataset, 3);

	const classicRating =
		Math.floor(
			flatDataset.reduce((a, e) => a + Math.round((e.calculatedData.rating ?? 0) * 100), 0) /
				flatDataset.length
		) / 100;

	return (
		<Row>
			<Col xs={12}>
				<Card
					header={`${reqUser.username}'s NaiveRatingClassic: ${classicRating.toFixed(2)}`}
				>
					<TachiTable
						dataset={compoundDataset}
						headers={[]}
						entryName="Errors"
						pageLen={100}
						noTopDisplayStr
						noBottomDisplayPager
						rowFunction={(pbs) => (
							<CompactRow
								pbs={pbs}
								game={game}
								playtype={playtype}
								scoreField={(pb) => FormatMillions(pb.scoreData.score)}
								ratingField={(pb) => pb.calculatedData.rating?.toFixed(2) ?? "0.00"}
								lampField={(pb) =>
									ShortLamp(pb.scoreData.noteLamp, pb.scoreData.bellLamp)
								}
							/>
						)}
					/>
				</Card>
			</Col>
		</Row>
	);
}

function ComponentRefresh({ game, playtype, reqUser }: UGPT) {
	if (game !== "ongeki" || playtype !== "Single") {
		return <></>;
	}
	const query1 = useApiQuery<{
		pbs: Array<PBScoreDocument<"ongeki:Single">>;
		songs: Array<SongDocument<"ongeki">>;
		charts: Array<ChartDocument<"ongeki:Single">>;
	}>(`/users/${reqUser.id}/games/${game}/${playtype}/pbs/best?alg=scoreRating`);

	const query2 = useApiQuery<{
		pbs: Array<PBScoreDocument<"ongeki:Single">>;
		songs: Array<SongDocument<"ongeki">>;
		charts: Array<ChartDocument<"ongeki:Single">>;
	}>(`/users/${reqUser.id}/games/${game}/${playtype}/pbs/best?alg=starRating`);

	if (query1.error) {
		return <ApiError error={query1.error} />;
	}

	if (query2.error) {
		return <ApiError error={query2.error} />;
	}

	if (!query1.data || !query2.data) {
		return <Loading />;
	}

	const flatDatasetScore: PBDataset<"ongeki:Single"> = CreateFlatDataset(
		query1.data,
		"scoreRating",
		60
	);
	const flatDatasetStar: PBDataset<"ongeki:Single"> = CreateFlatDataset(
		query2.data,
		"starRating",
		51
	);

	const datasetScore = ColumnMerge<"ongeki:Single">(flatDatasetScore, 3);
	const datasetStar = ColumnMerge<"ongeki:Single">(flatDatasetStar, 3);

	const scoreR1k = Math.floor(
		flatDatasetScore.reduce(
			(a, e) => a + Math.round((e.calculatedData.scoreRating ?? 0) * 1000),
			0
		) / 60
	);
	const starR1k = Math.floor(
		flatDatasetStar
			.slice(0, 50)
			.reduce((a, e) => a + Math.round((e.calculatedData.starRating ?? 0) * 1000), 0) / 50
	);
	const finalRating = ((Math.floor(scoreR1k * 1.2) + starR1k) / 1000.0).toFixed(3);

	return (
		<Row>
			<Col xs={12}>
				<Card
					header={`${reqUser.username}'s NaiveRatingRefresh: ${(scoreR1k / 1000).toFixed(
						3
					)} x 1.2 + ${(starR1k / 1000).toFixed(3)} = ${finalRating}`}
				>
					<TachiTable
						dataset={datasetScore}
						headers={[]}
						entryName="Errors"
						pageLen={100}
						noTopDisplayStr
						noBottomDisplayPager
						rowFunction={(pbs) => (
							<CompactRow
								pbs={pbs}
								game={game}
								playtype={playtype}
								scoreField={(pb) => FormatMillions(pb.scoreData.score)}
								ratingField={(pb) =>
									pb.calculatedData.scoreRating?.toFixed(3) ?? "0.000"
								}
								lampField={(pb) =>
									ShortLamp(pb.scoreData.noteLamp, pb.scoreData.bellLamp)
								}
							/>
						)}
					/>
					<Divider />
					<TachiTable
						dataset={datasetStar}
						headers={[]}
						entryName="Errors"
						pageLen={100}
						noTopDisplayStr
						noBottomDisplayPager
						rowFunction={(pbs) => (
							<CompactRow
								pbs={pbs}
								game={game}
								playtype={playtype}
								count={50}
								scoreField={(pb, chart) =>
									`${FmtNum(pb.scoreData.platinumScore)}/${
										chart.data.maxPlatScore
									}`
								}
								ratingField={(pb) =>
									pb.calculatedData.starRating?.toFixed(3) ?? "0.000"
								}
								lampField={(pb) => StarField(pb.scoreData.platinumStars)}
							/>
						)}
					/>
				</Card>
			</Col>
		</Row>
	);
}

function CompactRow({
	pbs,
	game,
	playtype,
	count,
	scoreField,
	ratingField,
	lampField,
}: {
	pbs: PBDataset<"ongeki:Single">[0][];
	game: Game;
	playtype: Playtype;
	count?: number;
	scoreField: (
		pb: PBScoreDocument<"ongeki:Single">,
		chart: ChartDocument<"ongeki:Single">
	) => JSX.Element | string;
	ratingField: (pb: PBScoreDocument<"ongeki:Single">) => JSX.Element | string;
	lampField: (pb: PBScoreDocument<"ongeki:Single">) => JSX.Element | string;
}) {
	return (
		<tr>
			{pbs.map((pb) => {
				const index = pb.__related.index;
				const chart = pb.__related.chart;

				if (count !== undefined && index > count) {
					return <></>;
				}
				return (
					<>
						<IndexCellCustom index={index} />
						<DifficultyCell alwaysShort game={game} chart={chart} />
						<CompactCell
							pb={pb}
							chart={chart}
							song={pb.__related.song}
							scoreField={scoreField}
							ratingField={ratingField}
							lampField={lampField}
						/>
					</>
				);
			})}
		</tr>
	);
}

function CompactCell({
	pb,
	chart,
	song,
	scoreField,
	ratingField,
	lampField,
}: {
	pb: PBScoreDocument<"ongeki:Single">;
	chart: ChartDocument<"ongeki:Single">;
	song: SongDocument;
	scoreField: (
		pb: PBScoreDocument<"ongeki:Single">,
		chart: ChartDocument<"ongeki:Single">
	) => JSX.Element | string;
	ratingField: (pb: PBScoreDocument<"ongeki:Single">) => JSX.Element | string;
	lampField: (pb: PBScoreDocument<"ongeki:Single">) => JSX.Element | string;
}) {
	// Third-party scripts may find this useful
	const className = `c-${chart.data.inGameID}`;

	return (
		<td style={{ width: "300px" }} className={className}>
			<div style={{ textAlign: "left" }}>
				<div>
					<GentleLink to={CreateChartLink(chart, "ongeki")}>{song.title}</GentleLink>
				</div>
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(3, 1fr)",
						gap: "5px",
					}}
				>
					<span>{scoreField(pb, chart)}</span>
					<span>{ratingField(pb)}</span>
					<span>{lampField(pb)}</span>
				</div>
			</div>
		</td>
	);
}

function IndexCellCustom({ index }: { index: integer }) {
	const COLORS = ["rgba(212,175,55,0.2)", "rgba(192,192,192,0.2)", "rgba(139,69,19,0.2)"];

	return (
		<td
			style={{
				backgroundColor: index < 3 ? COLORS[index] : ChangeOpacity(COLOUR_SET.gray, 0.15),
			}}
		>
			<span className="text-body-secondary" style={{ marginRight: "1px" }}>
				#{index + 1}
			</span>
		</td>
	);
}

function ShortLamp(noteLamp: string, bellLamp: string) {
	let res = "";
	if (noteLamp === "ALL BREAK+") {
		return "ABFB+";
	}
	if (noteLamp === "ALL BREAK") {
		res = "AB";
	} else if (noteLamp === "FULL COMBO") {
		res = "FC";
	}
	if (bellLamp === "FULL BELL") {
		res += "FB";
	}
	return res;
}

function CreateFlatDataset<T extends GPTString>(data: any, alg: AnyScoreRatingAlg, count: number) {
	const flatDataset: PBDataset<T> = [];

	const songMap = CreateSongMap(data.songs);
	const chartMap = CreateChartMap<T>(data.charts);

	const sortedRatings = data.pbs
		.map((e) => e.calculatedData[alg])
		.sort(NumericSOV((x: number) => x ?? -Infinity, true));

	for (const pb of data.pbs.slice(0, count)) {
		const song = songMap.get(pb.songID);
		const chart = chartMap.get(pb.chartID);

		if (song === undefined || chart === undefined) {
			continue;
		}

		flatDataset.push({
			...pb,
			__related: {
				chart,
				song,
				index: sortedRatings.indexOf(pb.calculatedData[alg]),
			},
		});
	}

	return flatDataset;
}

function ColumnMerge<T extends GPTString>(flatDataset: PBDataset<T>, columns: number) {
	const compoundDataset: PBDataset<T>[] = [[]];
	for (const d of flatDataset) {
		const back = compoundDataset[compoundDataset.length - 1];
		back.push(d);
		if (back.length === columns) {
			compoundDataset.push([]);
		}
	}
	return compoundDataset.filter((p) => p.length > 0);
}

export const ONGEKIClassicBreakdownInsight: GPTUtility = {
	name: "O.N.G.E.K.I. Classic Rating Breakdown",
	urlPath: "classic-rating",
	description: `See what PBs are going into your NaiveRatingClassic!`,
	component: ComponentClassic,
	personalUseOnly: false,
};

export const ONGEKIRefreshBreakdownInsight: GPTUtility = {
	name: "O.N.G.E.K.I. Refresh Rating Breakdown",
	urlPath: "refresh-rating",
	description: `See what PBs are going into your NaiveRatingRefresh!`,
	component: ComponentRefresh,
	personalUseOnly: false,
};
