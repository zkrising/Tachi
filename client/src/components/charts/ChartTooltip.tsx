import React from "react";
import { PointTooltipProps } from "@nivo/line";
import { BarTooltipProps } from "@nivo/bar";

const defaultRenderFn = (point: PointTooltipProps["point"]) => (
	<div>
		{point.data.xFormatted} {point.data.yFormatted}
	</div>
);

export default function ChartTooltip({
	renderFn = defaultRenderFn,
	point,
}: {
	point: PointTooltipProps["point"];
	renderFn?: (p: PointTooltipProps["point"]) => JSX.Element;
}) {
	return (
		<div
			className="chart-tooltip d-flex align-items-center justify-content-center"
			style={{
				padding: "1rem",
				backgroundColor: "#131313",
				borderRadius: "1px 1px 1px 1px",
				boxShadow: "0px 0px 5px 0px black",
			}}
		>
			{renderFn(point)}
		</div>
	);
}

const defaultBarRenderFn = (data: BarTooltipProps<unknown>) => (
	<div>
		{data.label} {data.value}
	</div>
);

export function BarChartTooltip({
	renderFn = defaultBarRenderFn,
	point,
}: {
	point: BarTooltipProps<unknown>;
	renderFn?: (p: BarTooltipProps<unknown>) => JSX.Element;
}) {
	return (
		<div
			className="chart-tooltip d-flex align-items-center justify-content-center"
			style={{
				padding: "1rem",
				backgroundColor: "#131313",
				borderRadius: "1px 1px 1px 1px",
				boxShadow: "0px 0px 5px 0px black",
				width: 200,
			}}
		>
			{renderFn(point)}
		</div>
	);
}
