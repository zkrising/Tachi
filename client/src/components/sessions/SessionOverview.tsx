import { TACHI_CHART_THEME } from "util/constants/chart-theme";
import { UppercaseFirst } from "util/misc";
import { NumericSOV } from "util/sorts";
import { FormatDuration } from "util/time";
import { ResponsiveLine } from "@nivo/line";
import ChartTooltip from "components/charts/ChartTooltip";
import Card from "components/layout/page/Card";
import ScoreTable from "components/tables/scores/ScoreTable";
import DebugContent from "components/util/DebugContent";
import Divider from "components/util/Divider";
import { UserContext } from "context/UserContext";
import { ColourConfig } from "lib/config";
import React, { useContext, useMemo } from "react";
import { Col } from "react-bootstrap";
import { ChartDocument, GetGamePTConfig, ScoreDocument, SongDocument } from "tachi-common";
import { SessionReturns } from "types/api-returns";
import { GamePT } from "types/react";
import { ScoreDataset } from "types/tables";

export default function SessionOverview({
	sessionData,
	scoreDataset,
}: {
	sessionData: SessionReturns;
	scoreDataset: ScoreDataset;
}) {
	const { scores, session } = sessionData;
	const { user } = useContext(UserContext);

	// const performanceDataset = useMemo(() => {
	// 	const d = [];

	// 	for (const scoreInfo of session.scoreInfo) {
	// 		const score = scoreMap.get(scoreInfo.scoreID);

	// 		if (!score) {
	// 			console.error(`Score ${scoreInfo.scoreID} doesn't exist?`);
	// 			continue;
	// 		}

	// 		const chart = chartMap.get(score.chartID);
	// 		const song = songMap.get(score.songID);

	// 		if (!chart || !song) {
	// 			console.error(`Chart ${score.chartID} (${score.songID}) has no chart?`);
	// 			continue;
	// 		}

	// 		d.push({
	// 			...score,
	// 			__related: {
	// 				song,
	// 				chart,
	// 			},
	// 		});
	// 	}

	// 	return d;
	// }, [sessionData]);

	return (
		<>
			<StatThing name="Scores" value={session.scoreInfo.length} />
			<StatThing
				name="Duration"
				value={FormatDuration(session.timeEnded - session.timeStarted)}
			/>
			<StatThing md12 name="Highlights" value={scores.filter(e => e.highlight).length} />
			<Col xs={12}>
				<Divider />
				<Card header="Highlights">
					<ScoreTable
						game={session.game}
						playtype={session.playtype}
						dataset={scoreDataset.filter(e => e.highlight)}
					/>
				</Card>
			</Col>
		</>
	);
}

function StatThing({
	value,
	name,
	md12,
}: {
	value: string | number;
	name: string;
	md12?: boolean;
}) {
	return (
		<Col xs={12} md={md12 ? 12 : 6} lg={4}>
			<div className="card">
				<div className="card-body">
					<div className="display-4">{value}</div>
					<div style={{ fontSize: "1.2rem" }}>{name}</div>
				</div>
			</div>
		</Col>
	);
}

type PerformanceData = ScoreDocument & {
	__related: {
		chart: ChartDocument;
		song: SongDocument;
	};
};

function PerformanceComponent({
	dataset,
	timeStart,
	game,
	playtype,
}: {
	dataset: PerformanceData[];
	timeStart: number;
} & GamePT) {
	const gptConfig = GetGamePTConfig(game, playtype);

	const data = useMemo(() => {
		const data = [];

		for (const alg of gptConfig.scoreRatingAlgs) {
			data.push({
				id: UppercaseFirst(alg),
				data: dataset
					.map(e => ({
						x: e.timeAchieved!,
						y: (e.calculatedData[alg] ?? 0) < 0 ? null : e.calculatedData[alg] ?? 0,
					}))
					.sort(NumericSOV(e => e.x, true)),
			});
		}
		return data;
	}, [dataset]);

	return (
		<Card header="Session Graph" style={{ width: "100%" }}>
			<div style={{ width: "100%", height: "400px" }}>
				<ResponsiveLine
					data={data}
					margin={{ top: 30, bottom: 50, left: 40, right: 40 }}
					xScale={{ type: "time", format: "%Q" }}
					axisBottom={{
						format: (x: Date) => FormatDuration(timeStart - x.valueOf()),
					}}
					gridXValues={3}
					motionConfig="stiff"
					crosshairType="x"
					yScale={{ type: "linear", min: "auto", max: "auto" }}
					colors={[ColourConfig.primary]}
					useMesh={true}
					theme={TACHI_CHART_THEME}
					tooltip={d => (
						<ChartTooltip point={d.point} renderFn={r => <DebugContent data={r} />} />
					)}
					// legends={[]}
					enableArea
				/>
			</div>
		</Card>
	);
}
