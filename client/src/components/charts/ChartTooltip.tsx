import React from "react";
import { PointTooltipProps } from "@nivo/line";

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
