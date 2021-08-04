import React from "react";
import { ResponsiveLine, Serie } from "@nivo/line";
import { TACHI_CHART_THEME } from "util/constants/chart-theme";
import { ColourConfig } from "lib/config";

export default function IIDXLampChart({
	width = "100%",
	height = "100%",
	mobileHeight = "100%",
	mobileWidth = width,
	data,
	axisBottom,
	axisLeft,
	curve,
	...props
}: {
	mobileHeight?: number | string;
	mobileWidth?: number | string;
	width?: number | string;
	height?: number | string;
	data: Serie[];
} & ResponsiveLine["props"]) {
	return (
		<>
			<div className="d-block d-md-none" style={{ height: mobileHeight, width: mobileWidth }}>
				<ResponsiveLine
					data={data}
					margin={{ top: 30, bottom: 50, left: 30, right: 0 }}
					axisBottom={axisBottom}
					motionConfig="stiff"
					crosshairType="x"
					yScale={{ type: "linear", min: 0, max: 100 }}
					axisLeft={axisLeft}
					enablePoints={false}
					colors={[ColourConfig.primary]}
					useMesh={true}
					theme={TACHI_CHART_THEME}
					curve={curve}
					legends={[]}
					{...props}
				/>
			</div>
			<div className="d-none d-md-block" style={{ height, width }}>
				<ResponsiveLine
					data={data}
					margin={{ top: 30, bottom: 50, left: 30, right: 0 }}
					axisBottom={axisBottom}
					motionConfig="stiff"
					crosshairType="x"
					yScale={{ type: "linear", min: 0, max: 100 }}
					axisLeft={axisLeft}
					enablePoints={false}
					colors={[ColourConfig.primary]}
					useMesh={true}
					theme={TACHI_CHART_THEME}
					curve={curve}
					legends={[]}
					{...props}
				/>
			</div>
		</>
	);
}
