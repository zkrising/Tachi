import { TACHI_LINE_THEME } from "util/constants/chart-theme";
import React from "react";
import { ResponsiveLine, Serie, Datum, DatumValue, PointTooltipProps } from "@nivo/line";
import { COLOUR_SET } from "tachi-common";
import ChartTooltip from "./ChartTooltip";

const formatTime = (s: DatumValue) =>
	`${Math.floor(Number(s) / 60)
		.toString()
		.padStart(2, "0")}:${Math.floor(Number(s) % 60)
		.toString()
		.padStart(2, "0")}`;

const scoreToLamp = (s: number) => {
	switch (s) {
		case 970000:
			return "S";
		case 990000:
			return "SS";
		case 1000000:
			return "SSS";
		case 1007500:
			return "SSS+";
	}
	return "";
};

const typeSpecificParams = (t: "Score" | "Bells" | "Life", minBells: number) => {
	switch (t) {
		case "Score":
			return {
				yScale: { type: "linear", min: 970000, max: 1010000 },
				yFormat: ">-,.0f",
				axisLeft: {
					tickValues: [970000, 990000, 1000000, 1007500, 1010000],
					format: scoreToLamp,
				},
				gridYValues: [970000, 980000, 990000, 1000000, 1007500, 1010000],
				colors: [
					COLOUR_SET.white,
					COLOUR_SET.gold,
					COLOUR_SET.paleOrange,
					COLOUR_SET.teal,
					COLOUR_SET.red,
				],
				areaBaselineValue: 970000,
				tooltip: (d: PointTooltipProps) => (
					<ChartTooltip>
						{d.point.data.y === 969999 ? "< 970,000 " : d.point.data.yFormatted}@{" "}
						{formatTime(d.point.data.x)}
					</ChartTooltip>
				),
			};
		case "Bells":
			return {
				yScale: { type: "linear", min: minBells, max: 0, stacked: false },
				enableGridY: false,
				axisLeft: { format: (e: number) => Math.floor(e) === e && e },
				colors: COLOUR_SET.vibrantYellow,
				areaBaselineValue: minBells,
				tooltip: (d: PointTooltipProps) => (
					<ChartTooltip>
						MAX{d.point.data.y === 0 ? "" : d.point.data.y} @{" "}
						{formatTime(d.point.data.x)}
					</ChartTooltip>
				),
			};
		case "Life":
			return {
				colors: COLOUR_SET.green,
				enableGridY: false,
				yScale: { type: "linear", min: 0, max: 100 },
				axisLeft: { format: (d: number) => `${d}%` },
				areaBaselineValue: 0,
				tooltip: (d: PointTooltipProps) => (
					<ChartTooltip>
						{d.point.data.y}% @ {formatTime(d.point.data.x)}
					</ChartTooltip>
				),
			};
		default:
			return {};
	}
};

export default function OngekiScoreChart({
	width = "100%",
	height = "100%",
	mobileHeight = "100%",
	mobileWidth = width,
	type,
	data,
}: {
	mobileHeight?: number | string;
	mobileWidth?: number | string;
	width?: number | string;
	height?: number | string;
	type: "Score" | "Bells" | "Life";
	data: Serie[];
} & ResponsiveLine["props"]) {
	let realData = data;

	if (type === "Score") {
		// Store 5 subgraphs: SSS+, SSS, SS, S, below S
		const res: Datum[][] = [[], [], [], [], []];
		let idx = 0;
		let previousPoint = null;
		for (const val of data[0].data) {
			const y = val?.y;
			if (y === null || y === undefined) {
				break;
			} else if (y >= 1007500) {
				idx = 0;
			} else if (y >= 1000000) {
				idx = 1;
			} else if (y >= 990000) {
				idx = 2;
			} else if (y >= 970000) {
				idx = 3;
			} else if (y !== null) {
				idx = 4;
				// 969999 is used to represent any value below 970k
				// Actual values look ugly on the graph
				val.y = 969999;
			} else {
				break;
			}

			// If this is the first point, connect with the previous subgraph
			if (previousPoint !== null && res[idx].length === 0) {
				res[idx].push(previousPoint);
			}
			res[idx].push(val);
			previousPoint = val;
		}

		realData = res.map((serie, i) => ({
			id: `Score ${i}`,
			data: serie,
		}));
	}
	const maxBells =
		type === "Bells"
			? Math.min(
					-1,
					Math.floor(
						Number(realData[0].data[realData[0].data.length - 1]?.y ?? -1) * 1.333
					)
			  )
			: 0;
	const component = (
		<ResponsiveLine
			data={realData}
			margin={{ top: 30, bottom: 50, left: 50, right: 50 }}
			xScale={{ type: "linear", min: 0, max: data[0].data.length - 1 }}
			motionConfig="stiff"
			crosshairType="x"
			enablePoints={false}
			useMesh={true}
			enableGridX={false}
			theme={TACHI_LINE_THEME}
			axisBottom={{ format: (d: number) => formatTime(d) }}
			curve="linear"
			legends={[]}
			enableArea
			{...(typeSpecificParams(type, maxBells) as any)}
		/>
	);

	return (
		<>
			<div className="d-block d-md-none" style={{ height: mobileHeight, width: mobileWidth }}>
				{component}
			</div>
			<div className="d-none d-md-block" style={{ height, width }}>
				{component}
			</div>
		</>
	);
}
