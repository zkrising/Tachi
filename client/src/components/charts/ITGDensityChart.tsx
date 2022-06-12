import { ResponsiveLine, Serie } from "@nivo/line";
import React from "react";
import { COLOUR_SET } from "tachi-common";
import ChartTooltip from "./ChartTooltip";

export default function ITGDensityChart({
	width = "100%",
	height = "100%",
	mobileHeight = "100%",
	mobileWidth = width,
	data,
}: {
	mobileHeight?: number | string;
	mobileWidth?: number | string;
	width?: number | string;
	height?: number | string;
	data: Serie[];
} & ResponsiveLine["props"]) {
	const component = (
		<ResponsiveLine
			data={data}
			margin={{ top: 30, bottom: 50, left: 90, right: 50 }}
			xScale={{ type: "linear" }}
			motionConfig="stiff"
			crosshairType="x"
			yScale={{ type: "linear" }}
			axisLeft={{ format: y => `${npsToBPM(y)}BPM` }}
			enablePoints={false}
			useMesh={true}
			enableGridX={false}
			colors={COLOUR_SET.purple}
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
			tooltip={d => (
				<ChartTooltip
					point={d.point}
					renderFn={p => (
						<div>
							Measure {p.data.xFormatted}:{" "}
							{npsToBPM(Number(p.data.yFormatted)).toFixed()}BPM
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

// Always assume 4/4 time. I know it sucks, but stepmania does the same.
function npsToBPM(nps: number) {
	return (nps * 60) / 4;
}

function bpmToNPS(bpm: number) {
	return (bpm * 4) / 60;
}
