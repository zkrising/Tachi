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
import { COLOUR_SET, Difficulties, Game } from "tachi-common";
import { GPT_CLIENT_IMPLEMENTATIONS } from "lib/game-implementations";
import ChartTooltip from "./ChartTooltip";

const formatTime = (s: DatumValue) =>
	`${Math.floor(Number(s) / 60)
		.toString()
		.padStart(2, "0")}:${Math.floor(Number(s) % 60)
		.toString()
		.padStart(2, "0")}`;

const getScoreYAxisNotch = (game: Game) => (s: number) => {
	if (game === "ongeki") {
		switch (s) {
			case 970_000:
				return "S";
			case 990_000:
				return "SS";
			case 1000_000:
				return "SSS";
			case 1007_500:
				return "SSS+";
		}
	}

	if (game === "chunithm") {
		switch (s) {
			case 990_000:
				return "S+";
			case 1000_000:
				return "SS";
			case 1005_000:
				return "SS+";
			case 1007_500:
				return "SSS";
			case 1009_000:
				return "SSS+";
		}
	}

	if (game === "maimaidx") {
		switch (s) {
			case 97:
				return "S";
			case 98:
				return "S+";
			case 99:
				return "SS";
			case 99.5:
				return "SS+";
			case 100:
				return "SSS";
			case 100.5:
				return "SSS+";
		}
	}

	return "";
};

const strokeColor = (
	type:
		| Difficulties["ongeki:Single"]
		| Difficulties["chunithm:Single"]
		| Difficulties["maimaidx:Single"]
		| "BELLS"
) => {
	const isLight = getTheme() === "light";

	if (type === "Basic" || type === "DX Basic" || type === "BASIC") {
		return `hsl(120, 60%, ${isLight ? 25 : 47}%)`;
	}

	if (type === "Advanced" || type === "DX Advanced" || type === "ADVANCED") {
		return `hsl(35, 60%, ${isLight ? 35 : 60}%)`;
	}

	if (type === "Expert" || type === "DX Expert" || type === "EXPERT") {
		return `hsl(330, 50%, ${isLight ? 35 : 67}%)`;
	}

	if (type === "Master" || type === "DX Master" || type === "MASTER") {
		return `hsl(280, 60%, ${isLight ? 35 : 67}%)`;
	}

	if (type === "ULTIMA") {
		return `hsl(360, 50%, ${isLight ? 35 : 67}%)`;
	}

	if (type === "BELLS") {
		return `hsl(55, 90%, ${isLight ? 35 : 42}%)`;
	}

	return `hsl(0, 0%, ${isLight ? 35 : 67}%)`;
};

const limitScoreGraph = (game: Game, data: Serie[]) => {
	for (const val of data[0].data) {
		if (typeof val.y !== "number") {
			break;
		}
		if (game === "ongeki" && val.y < 970_000) {
			// 969999 will be used to represent values below S
			// Without this, the line would cross the bottom axis
			// which looks very bad
			val.y = 969_999;
		}
		if (game === "chunithm" && val.y < 990_000) {
			val.y = 989_999;
		}
		if (game === "maimaidx" && val.y < 97) {
			val.y = 96.9999;
		}
	}
	return data;
};

const bellFloor = (data: Datum[], totalBellCount: number) => {
	// Scale the chart so that it drops by 3/4, unless it's a flatline
	const lowestValue = Number(data.filter((v) => v.y !== null).pop()?.y ?? 0);
	return lowestValue === 0
		? -totalBellCount
		: clamp(-totalBellCount, Math.floor(lowestValue * 1.333), -1);
};

export default function GekichumaiScoreChart({
	width = "100%",
	height = "100%",
	mobileHeight = "100%",
	mobileWidth = width,
	type,
	difficulty,
	totalBellCount,
	data,
	game,
	duration,
}: {
	mobileHeight?: number | string;
	mobileWidth?: number | string;
	width?: number | string;
	height?: number | string;
	type: "Score" | "Bells" | "Life";
	difficulty:
		| Difficulties["ongeki:Single"]
		| Difficulties["chunithm:Single"]
		| Difficulties["maimaidx:Single"];
	totalBellCount?: number;
	data: Serie[];
	game: "chunithm" | "ongeki" | "maimaidx";
	duration: number;
} & ResponsiveLine["props"]) {
	let color = COLOUR_SET.gray;

	if (type === "Score") {
		if (game === "chunithm") {
			color =
				GPT_CLIENT_IMPLEMENTATIONS["chunithm:Single"].difficultyColours[
					difficulty as Difficulties["chunithm:Single"]
				];
		} else if (game === "ongeki") {
			color =
				GPT_CLIENT_IMPLEMENTATIONS["ongeki:Single"].difficultyColours[
					difficulty as Difficulties["ongeki:Single"]
				];
		} else if (game === "maimaidx") {
			color =
				GPT_CLIENT_IMPLEMENTATIONS["maimaidx:Single"].difficultyColours[
					difficulty as Difficulties["maimaidx:Single"]
				];
		}
	} else if (type === "Bells") {
		color = COLOUR_SET.vibrantYellow;
	} else {
		color = COLOUR_SET.vibrantGreen;
	}

	const gradientId = type === "Score" ? difficulty : type;

	const commonProps: Omit<LineSvgProps, "data"> = {
		margin: { top: 30, bottom: 50, left: 50, right: 50 },
		enableGridX: false,
		xScale: { type: "linear", min: 0, max: duration },
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
		if (game === "ongeki") {
			component = (
				<ResponsiveLine
					{...commonProps}
					data={limitScoreGraph(game, data)}
					yScale={{ type: "linear", min: 970000, max: 1010000 }}
					yFormat={">-,.0f"}
					axisLeft={{
						tickValues: [970000, 990000, 1000000, 1007500, 1010000],
						format: getScoreYAxisNotch(game),
					}}
					gridYValues={[970000, 980000, 990000, 1000000, 1007500, 1010000]}
					enableGridY={true}
					colors={strokeColor(difficulty)}
					areaBaselineValue={970000}
					tooltip={(d: PointTooltipProps) => (
						<ChartTooltip>
							{d.point.data.y === 969999 ? "< 970,000 " : d.point.data.yFormatted}@{" "}
							{formatTime(d.point.data.x)}
						</ChartTooltip>
					)}
				/>
			);
		} else if (game === "chunithm") {
			component = (
				<ResponsiveLine
					{...commonProps}
					data={limitScoreGraph(game, data)}
					yScale={{ type: "linear", min: 990_000, max: 1010_000 }}
					yFormat={">-,.0f"}
					axisLeft={{
						tickValues: [990_000, 1000_000, 1005_000, 1007_500, 1009_000, 1010_000],
						format: getScoreYAxisNotch(game),
					}}
					gridYValues={[990_000, 1000_000, 1005_000, 1007_500, 1009_000, 1010_000]}
					enableGridY={true}
					colors={strokeColor(difficulty)}
					areaBaselineValue={990000}
					tooltip={(d: PointTooltipProps) => (
						<ChartTooltip>
							{d.point.data.y === 989_999 ? "< 990,000 " : d.point.data.yFormatted}@{" "}
							{formatTime(d.point.data.x)}
						</ChartTooltip>
					)}
				/>
			);
		} else if (game === "maimaidx") {
			component = (
				<ResponsiveLine
					{...commonProps}
					data={limitScoreGraph(game, data)}
					yScale={{ type: "linear", min: 97, max: 101 }}
					yFormat={">-,.0f"}
					axisLeft={{
						tickValues: [97, 98, 99, 99.5, 100, 100.5, 101],
						format: getScoreYAxisNotch(game),
					}}
					gridYValues={[97, 98, 99, 99.5, 100, 100.5, 101]}
					enableGridY={true}
					colors={strokeColor(difficulty)}
					areaBaselineValue={97}
					tooltip={(d: PointTooltipProps) => (
						<ChartTooltip>
							{d.point.data.y === 96.9999 ? "< 97 " : d.point.data.yFormatted}@{" "}
							{formatTime(d.point.data.x)}
						</ChartTooltip>
					)}
				/>
			);
		}
	} else if (type === "Bells") {
		component = (
			<ResponsiveLine
				{...commonProps}
				data={data}
				yScale={{
					type: "linear",
					min: bellFloor(data[0].data, totalBellCount!),
					max: 0,
					stacked: false,
				}}
				enableGridY={false}
				axisLeft={{ format: (e: number) => Math.floor(e) === e && e }}
				colors={strokeColor("BELLS")}
				areaBaselineValue={bellFloor(data[0].data, totalBellCount!)}
				tooltip={(d: PointTooltipProps) => (
					<ChartTooltip>
						MAX{d.point.data.y === 0 ? "" : d.point.data.y} @{" "}
						{formatTime(d.point.data.x)}
					</ChartTooltip>
				)}
			/>
		);
	} else if (type === "Life") {
		const max = game === "ongeki" ? 100 : (data[0].data[0].y as number);
		const suffix = game === "ongeki" ? "%" : "";
		component = (
			<ResponsiveLine
				{...commonProps}
				data={data}
				yScale={{ type: "linear", min: 0, max }}
				enableGridY={false}
				axisLeft={{ format: (d: number) => `${d}${suffix}` }}
				colors={strokeColor("BASIC")}
				areaBaselineValue={0}
				tooltip={(d: PointTooltipProps) => (
					<ChartTooltip>
						{d.point.data.y}
						{suffix} @ {formatTime(d.point.data.x)}
					</ChartTooltip>
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
