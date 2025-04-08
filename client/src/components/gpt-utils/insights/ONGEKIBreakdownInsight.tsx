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
	ChartDocument,
	COLOUR_SET,
	CreateSongMap,
	Game,
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

function Component({ game, playtype, reqUser }: UGPT) {
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

	const songMap = CreateSongMap<"ongeki">(data.songs);
	const chartMap = CreateChartMap<"ongeki:Single">(data.charts);

	const flatDataset: PBDataset<"ongeki:Single"> = [];
	const compoundDataset: PBDataset<"ongeki:Single">[] = [[]];

	const sortedRatings = data.pbs
		.map((e) => e.calculatedData.rating)
		.sort(NumericSOV((x) => x ?? -Infinity, true));

	for (const pb of data.pbs.slice(0, 45)) {
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
				index: sortedRatings.indexOf(pb.calculatedData.rating),
			},
		});
	}

	for (const d of flatDataset) {
		const back = compoundDataset[compoundDataset.length - 1];
		back.push(d);
		if (back.length === 3) {
			compoundDataset.push([]);
		}
	}

	return (
		<Row>
			<Col xs={12}>
				<Card
					header={`${reqUser.username}'s Classic NaiveRating (${(
						Math.floor(
							flatDataset.reduce(
								(a, e) => a + (e.calculatedData.rating ?? 0) * 100,
								0
							) / flatDataset.length
						) / 100
					).toFixed(2)})`}
				>
					<TachiTable
						dataset={compoundDataset}
						headers={[]}
						entryName="Errors"
						pageLen={100}
						noTopDisplayStr
						noBottomDisplayPager
						rowFunction={(pbs) => (
							<CompactRow pbs={pbs} game={game} playtype={playtype} />
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
}: {
	pbs: PBDataset<"ongeki:Single">[0][];
	game: Game;
	playtype: Playtype;
}) {
	return (
		<tr>
			{pbs.map((pb) => {
				const chart = pb.__related.chart;
				return (
					<>
						<IndexCellCustom index={pb.__related.index} />
						<DifficultyCell alwaysShort game={game} chart={chart} />
						<CompactCell pb={pb} chart={chart} song={pb.__related.song} />
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
}: {
	pb: PBScoreDocument<"ongeki:Single">;
	chart: ChartDocument<"ongeki:Single">;
	song: SongDocument<"ongeki">;
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
					<span>{FormatMillions(pb.scoreData.score)}</span>
					<span>{pb.calculatedData.rating?.toFixed(2)}</span>
					<span>{ShortLamp(pb.scoreData.noteLamp, pb.scoreData.bellLamp)}</span>
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

export const ONGEKIBreakdownInsight: GPTUtility = {
	name: "O.N.G.E.K.I. Classic Rating Breakdown",
	urlPath: "rating",
	description: `See what PBs are going into your classic profile rating!`,
	component: Component,
	personalUseOnly: false,
};
