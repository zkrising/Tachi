import { TACHI_LINE_THEME } from "util/constants/chart-theme";
import React from "react";
import { ResponsiveLine, Serie } from "@nivo/line";
import { COLOUR_SET } from "tachi-common";
import ChartTooltip from "./ChartTooltip";

const formatTime = (s: number) =>
	`${Math.floor(s / 60)
		.toString()
		.padStart(2, "0")}:${Math.floor(s % 60)
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

const typeSpecificParams = (t: "Score" | "Bells" | "Life", maxBells: number) => {
	const minBells = Math.min(-maxBells, -1);
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
				colors: COLOUR_SET.blue,
				areaBaselineValue: 970000,
				tooltip: (d: any) => (
					<ChartTooltip>
						{d.point.data.y === 970000 ? "≤ " : ""}
						{d.point.data.yFormatted} @ {formatTime(d.point.data.x)}
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
				tooltip: (d: any) => (
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
				tooltip: (d: any) => (
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
	maxBells,
	data,
}: {
	mobileHeight?: number | string;
	mobileWidth?: number | string;
	width?: number | string;
	height?: number | string;
	type: "Score" | "Bells" | "Life";
	maxBells: number;
	data: Serie[];
} & ResponsiveLine["props"]) {
	const realData =
		type === "Score"
			? [
					{
						id: "Score",
						data: data[0].data.map(({ x, y }) => ({
							x,
							y: y && y < 970000 ? 970000 : y,
						})),
					},
			  ]
			: data;
	const component = (
		<ResponsiveLine
			data={realData}
			margin={{ top: 30, bottom: 50, left: 50, right: 50 }}
			xScale={{ type: "linear", min: 0, max: data[0].data.length }}
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
