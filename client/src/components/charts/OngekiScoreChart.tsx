import { TACHI_LINE_THEME } from "util/constants/chart-theme";
import { clamp } from "util/misc";
import { ChangeOpacity } from "util/color-opacity";
import { getTheme } from "util/themeUtils";
import React from "react";
import {
	ResponsiveLine,
	Serie,
	Datum,
	DatumValue,
	PointTooltipProps,
	LineSvgProps,
} from "@nivo/line";
import { COLOUR_SET, Difficulties, FmtStars } from "tachi-common";
import { GPT_CLIENT_IMPLEMENTATIONS } from "lib/game-implementations";
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

const strokeColor = (type: Difficulties["ongeki:Single"] | "BELLS") => {
	const isLight = getTheme() === "light";
	switch (type) {
		case "BASIC":
			return `hsl(120, 60%, ${isLight ? 25 : 47}%)`;
		case "ADVANCED":
			return `hsl(35, 60%, ${isLight ? 35 : 60}%)`;
		case "EXPERT":
			return `hsl(330, 50%, ${isLight ? 35 : 67}%)`;
		case "MASTER":
			return `hsl(280, 60%, ${isLight ? 35 : 67}%)`;
		case "BELLS":
			return `hsl(55, 90%, ${isLight ? 35 : 42}%)`;
		default:
			return `hsl(0, 0%, ${isLight ? 35 : 67}%)`;
	}
};

const limitScoreGraph = (data: Serie[], minval: number) => {
	for (const val of data[0].data) {
		if (val.y === null || val.y === undefined) {
			break;
		}
		if (val.y < minval) {
			// (minval-1) (969999 for tech score) will be used
			// to represent values below S
			// Without this, the line would cross the bottom axis
			// which looks very bad
			val.y = minval - 1;
		}
	}
	return data;
};

const scaleFloor = (data: Datum[], maximum: number | undefined) => {
	if (maximum === undefined) {
		return 0;
	}
	// Scale the chart so that it drops by 3/4, unless it's a flatline
	const lowestValue = Number(data.filter((v) => v.y !== null).pop()?.y ?? 0);
	return lowestValue === 0 ? -maximum : clamp(-maximum, Math.floor(lowestValue * 1.333), -1);
};

const platinumTooltip = (d: Datum, starValues: number[]) => {
	if (d.point.data.y < starValues[0]) {
		return (
			<>
				{"< 1★"} @ {formatTime(d.point.data.x)}
			</>
		);
	}
	for (let i = 1; i < 6; ++i) {
		if (d.point.data.y < starValues[i]) {
			return (
				<>
					MAX{d.point.data.y} ({i < 5 ? i + 1 : "虹"}
					{"★"}-{starValues[i] - d.point.data.y}) @ {formatTime(d.point.data.x)}
				</>
			);
		}
	}
	return (
		<>
			MAX{d.point.data.y === 0 ? "" : d.point.data.y} @ {formatTime(d.point.data.x)}
		</>
	);
};

export default function OngekiScoreChart({
	width = "100%",
	height = "100%",
	mobileHeight = "100%",
	mobileWidth = width,
	type,
	difficulty,
	maximumAbsoluteValue,
	data,
}: {
	mobileHeight?: number | string;
	mobileWidth?: number | string;
	width?: number | string;
	height?: number | string;
	type: "Score" | "Platinum" | "Bells" | "Life";
	difficulty: Difficulties["ongeki:Single"];
	maximumAbsoluteValue?: number;
	data: Serie[];
} & ResponsiveLine["props"]) {
	const color =
		type === "Score"
			? GPT_CLIENT_IMPLEMENTATIONS["ongeki:Single"].difficultyColours[difficulty]
			: type === "Bells"
			? COLOUR_SET.vibrantYellow
			: type === "Life"
			? COLOUR_SET.vibrantGreen
			: COLOUR_SET.white;
	const gradientId = type === "Score" ? difficulty : type;

	const commonProps: Omit<LineSvgProps, "data"> = {
		margin: { top: 30, bottom: 50, left: 50, right: 50 },
		enableGridX: false,
		xScale: { type: "linear", min: 0, max: data[0].data.length - 1 },
		axisBottom: { format: (d: number) => formatTime(d) },
		motionConfig: "stiff",
		crosshairType: "x",
		enablePoints: false,
		useMesh: true,
		theme: TACHI_LINE_THEME,
		curve: "linear",
		legends: [],
		lineWidth: 2,
		enableArea: true,
		areaOpacity: 0.25,
		defs: [
			{
				id: `gradient-${gradientId}`,
				type: "linearGradient",
				colors: [
					{ offset: 0, color: color },
					{ offset: 100, color: ChangeOpacity(color, 0.65) },
				],
			},
		],
		fill: [{ match: "*", id: `gradient-${gradientId}` }],
	};

	let component;
	if (type === "Score") {
		component = (
			<ResponsiveLine
				{...commonProps}
				data={limitScoreGraph(data, 970000)}
				yScale={{ type: "linear", min: 970000, max: 1010000 }}
				yFormat={">-,.0f"}
				axisLeft={{
					tickValues: [970000, 990000, 1000000, 1007500, 1010000],
					format: scoreToLamp,
				}}
				gridYValues={[970000, 980000, 990000, 1000000, 1007500, 1010000]}
				enableGridY={true}
				colors={strokeColor(difficulty)}
				areaBaselineValue={970000}
				tooltip={(d: PointTooltipProps) => (
					<ChartTooltip>
						{d.point.data.y === 969999 ? "< 970,000" : d.point.data.yFormatted} @{" "}
						{formatTime(d.point.data.x)}
					</ChartTooltip>
				)}
			/>
		);
	} else if (type === "Bells") {
		component = (
			<ResponsiveLine
				{...commonProps}
				data={data}
				yScale={{
					type: "linear",
					min: scaleFloor(data[0].data, maximumAbsoluteValue),
					max: 0,
					stacked: false,
				}}
				enableGridY={false}
				axisLeft={{ format: (e: number) => Math.floor(e) === e && e }}
				colors={strokeColor("BELLS")}
				areaBaselineValue={scaleFloor(data[0].data, maximumAbsoluteValue)}
				tooltip={(d: PointTooltipProps) => (
					<ChartTooltip>
						MAX{d.point.data.y === 0 ? "" : d.point.data.y} @{" "}
						{formatTime(d.point.data.x)}
					</ChartTooltip>
				)}
			/>
		);
	} else if (type === "Life") {
		component = (
			<ResponsiveLine
				{...commonProps}
				data={data}
				yScale={{ type: "linear", min: 0, max: 100 }}
				enableGridY={false}
				axisLeft={{ format: (d: number) => `${d}%` }}
				colors={strokeColor("BASIC")}
				areaBaselineValue={0}
				tooltip={(d: PointTooltipProps) => (
					<ChartTooltip>
						{d.point.data.y}% @ {formatTime(d.point.data.x)}
					</ChartTooltip>
				)}
			/>
		);
	} else {
		const mav = maximumAbsoluteValue ?? 0; // shorthand
		const starValues = [
			Math.floor(mav * 0.94) - mav,
			Math.floor(mav * 0.95) - mav,
			Math.floor(mav * 0.96) - mav,
			Math.floor(mav * 0.97) - mav,
			Math.floor(mav * 0.98) - mav,
			Math.floor(mav * 0.99) - mav,
		];
		component = (
			<ResponsiveLine
				{...commonProps}
				data={limitScoreGraph(data, starValues[0])}
				yScale={{ type: "linear", min: starValues[0], max: 0 }}
				yFormat={">-,.0f"}
				axisLeft={{
					tickValues: starValues,
					format: (count: number) => {
						if (count === starValues[5]) {
							return "虹★";
						}
						for (let i = 0; i < 5; ++i) {
							if (count === starValues[i]) {
								return `${i + 1}★`;
							}
						}
						return "Error";
					},
				}}
				gridYValues={starValues}
				enableGridY={true}
				colors={strokeColor("LUNATIC")}
				areaBaselineValue={starValues[0]}
				tooltip={(d: PointTooltipProps) => (
					<ChartTooltip>{platinumTooltip(d, starValues)}</ChartTooltip>
				)}
			/>
		);
	}

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
