import React from "react";
import { ResponsiveLine, Serie, PointTooltipProps } from "@nivo/line";
import { TACHI_CHART_THEME } from "util/constants/chart-theme";
import ChartTooltip from "./ChartTooltip";
import { ColourConfig } from "lib/config";

export default function TimelineChart({
	width = "100%",
	height = "100%",
	mobileHeight = "100%",
	mobileWidth = width,
	data,
	axisBottom,
	axisLeft,
	tooltipRenderFn,
	reverse,
	curve,
	...props
}: {
	mobileHeight?: number | string;
	mobileWidth?: number | string;
	width?: number | string;
	height?: number | string;
	data: Serie[];
	tooltipRenderFn?: (p: PointTooltipProps["point"]) => JSX.Element;
	reverse?: boolean;
} & ResponsiveLine["props"]) {
	if (!data[0] || data[0].data.length < 2) {
		return (
			<>
				<div
					className="d-block d-md-none"
					style={{ height: mobileHeight, width: mobileWidth }}
				>
					<div className="d-flex h-100 justify-content-center align-items-center">
						<div className="text-center">
							Not Enough Data... Yet.
							<br />
							<small className="text-muted">
								(You need atleast 2 days worth of data)
							</small>
						</div>
					</div>
				</div>
				<div className="d-none d-md-block" style={{ height, width }}>
					<div className="d-flex h-100 justify-content-center align-items-center">
						<div className="text-center">
							Not Enough Data... Yet.
							<br />
							<small className="text-muted">
								(You need atleast 2 days worth of data)
							</small>
						</div>
					</div>
				</div>
			</>
		);
	}

	// bootstrap abuse to render two different graphs depending on what device.
	// yeah, it's not great.
	return (
		<>
			<div className="d-block d-md-none" style={{ height: mobileHeight, width: mobileWidth }}>
				<ResponsiveLine
					data={data}
					margin={{ top: 30, bottom: 50, left: 30, right: 0 }}
					xScale={{ type: "time", format: "%Q" }}
					xFormat="time:%Q"
					axisBottom={axisBottom}
					gridXValues={3}
					motionConfig="stiff"
					crosshairType="x"
					yScale={{ type: "linear", min: "auto", max: "auto", reverse }}
					axisLeft={axisLeft}
					enablePoints={false}
					colors={[ColourConfig.primary]}
					useMesh={true}
					theme={TACHI_CHART_THEME}
					curve={curve}
					tooltip={d => <ChartTooltip point={d.point} renderFn={tooltipRenderFn} />}
					legends={[]}
					{...props}
				/>
			</div>
			<div className="d-none d-md-block" style={{ height, width }}>
				<ResponsiveLine
					data={data}
					margin={{ top: 30, bottom: 50, left: 50, right: 50 }}
					xScale={{ type: "time", format: "%Q" }}
					xFormat="time:%Q"
					axisBottom={axisBottom}
					gridXValues={3}
					motionConfig="stiff"
					crosshairType="x"
					yScale={{ type: "linear", min: "auto", max: "auto", reverse }}
					axisLeft={axisLeft}
					enablePoints={false}
					colors={[ColourConfig.primary]}
					useMesh={true}
					theme={TACHI_CHART_THEME}
					curve={curve}
					tooltip={d => <ChartTooltip point={d.point} renderFn={tooltipRenderFn} />}
					legends={[]}
					{...props}
				/>
			</div>
		</>
	);
}
