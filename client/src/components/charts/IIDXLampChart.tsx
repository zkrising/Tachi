import React from "react";
import { ResponsiveLine, Serie } from "@nivo/line";
import { COLOUR_SET } from "tachi-common";
import ChartTooltip from "./ChartTooltip";

const yAxes = {
	Easy: [22, 60, 80, 100],
	Normal: [22, 60, 80, 100],
	Hard: [30, 50, 100],
	DAN_GAUGE: [30, 50, 100],
	EXHard: [30, 50, 100],
};

const colours = {
	DAN_GAUGE: COLOUR_SET.gray,
	Easy: [COLOUR_SET.green, COLOUR_SET.vibrantRed],
	Normal: [COLOUR_SET.blue, COLOUR_SET.vibrantRed],
	Hard: COLOUR_SET.vibrantRed,
	EXHard: COLOUR_SET.gold,
};

export default function IIDXLampChart({
	width = "100%",
	height = "100%",
	mobileHeight = "100%",
	mobileWidth = width,
	type,
	data,
	usePercentXAxis = false,
}: {
	mobileHeight?: number | string;
	mobileWidth?: number | string;
	width?: number | string;
	height?: number | string;
	data: Serie[];
	usePercentXAxis?: boolean;
	type: "DAN_GAUGE" | "Normal" | "Easy" | "Hard" | "EXHard";
} & ResponsiveLine["props"]) {
	let realData = [];

	if (type === "Hard" || type === "EXHard" || type === "DAN_GAUGE") {
		realData = data;
	} else {
		const failSet = [];
		const clearSet = [];

		let lastLastWasFail = true;
		let lastWasFail = true;

		for (const d of data[0].data) {
			if ((d.y ?? 0) >= 80) {
				if (lastWasFail) {
					clearSet.push(d);
					failSet.push(d);
				} else {
					clearSet.push(d);
					failSet.push({ x: d.x, y: null });
				}
			} else {
				if (!lastWasFail && !lastLastWasFail) {
					clearSet.push(d);
					failSet.push(d);
				} else {
					clearSet.push({ x: d.x, y: null });
					failSet.push(d);
				}
			}
			lastLastWasFail = lastWasFail;
			lastWasFail = (d.y ?? 0) < 80;
		}

		realData = [
			{ id: "fail", data: failSet },
			{ id: "clear", data: clearSet },
		];
	}

	const component = (
		<ResponsiveLine
			data={realData}
			margin={{ top: 30, bottom: 50, left: 50, right: 50 }}
			xScale={{ type: "linear" }}
			axisBottom={{
				format: usePercentXAxis
					? (x) => `${x / 100}%`
					: (x) => Math.floor(Number(x) / 4).toString(),
			}}
			motionConfig="stiff"
			crosshairType="x"
			yScale={{ type: "linear", min: 0, max: 100 }}
			axisLeft={{ tickValues: yAxes[type], format: (y) => `${y}%` }}
			enablePoints={false}
			useMesh={true}
			enableGridX={false}
			// defs={[
			// 	{
			// 		id: "nc",
			// 		type: "linearGradient",
			// 		colors: [
			// 			{ offset: 0, color: colours[type][1] },
			// 			{ offset: 20, color: colours[type][1] },
			// 			{ offset: 20.01, color: colours[type][0] },
			// 			{ offset: 100, color: colours[type][0] },
			// 		],
			// 	},
			// ]}
			colors={colours[type]}
			// fill={[
			// 	{
			// 		match: { id: "clear" },
			// 		id: "nc",
			// 	},
			// ]}
			theme={{
				background: "none",
				textColor: "#ffffff",
				grid: {
					line: {
						stroke: "#1c1c1c",
						strokeWidth: 1,
					},
				},
			}}
			curve="linear"
			tooltip={(d) => (
				<ChartTooltip
					point={d.point}
					renderFn={(p) => (
						<div>
							Measure {Math.floor(Number(p.data.xFormatted) / 4).toString()}:{" "}
							{p.data.yFormatted}%
						</div>
					)}
				/>
			)}
			legends={[]}
			enableArea
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
