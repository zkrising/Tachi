import React from "react";
import { FormatDate, FormatDuration, FormatTime, FormatTimeSmall, MillisToSince } from "util/time";
import { ResponsiveLine, Serie } from "@nivo/line";
import { DateTime } from "luxon";
import { TACHI_CHART_THEME } from "util/constants/chart-theme";
import ChartTooltip from "./ChartTooltip";

export default function TimelineChart<T>({
	width,
	height,
	data,
	yAxisFormat,
}: {
	width?: number | string;
	height?: number | string;
	data: Serie[];
	yAxisFormat?: (y: number) => string;
}) {
	return (
		<div style={{ height, width }}>
			<ResponsiveLine
				data={data}
				margin={{ right: 110, top: 30, bottom: 50, left: 60 }}
				xScale={{ type: "time", format: "%Q" }}
				xFormat="time:%Q"
				axisBottom={{
					format: x => FormatTimeSmall(Number(x)),
				}}
				yScale={{ type: "linear", min: "auto", max: "auto", stacked: true, reverse: false }}
				axisLeft={{
					tickSize: 5,
					tickPadding: 5,
					tickRotation: 0,
					format: y => (Number.isInteger(y) ? `#${-y}` : ""),
				}}
				enablePoints={false}
				enableArea={true}
				colors={["#cc527a"]}
				useMesh={true}
				theme={TACHI_CHART_THEME}
				tooltip={d => (
					<ChartTooltip
						point={d.point}
						renderFn={p => (
							<div>
								{MillisToSince(+p.data.xFormatted)}: #{-p.data.yFormatted}
								<br />
								<small className="text-muted">
									({FormatDate(+p.data.xFormatted)})
								</small>
							</div>
						)}
					/>
				)}
				legends={[
					{
						anchor: "bottom-right",
						direction: "column",
						justify: false,
						translateX: 100,
						translateY: 0,
						itemsSpacing: 0,
						itemDirection: "left-to-right",
						itemWidth: 80,
						itemHeight: 20,
						itemOpacity: 0.75,
						symbolSize: 12,
						symbolShape: "circle",
						symbolBorderColor: "rgba(0, 0, 0, .5)",
						effects: [
							{
								on: "hover",
								style: {
									itemBackground: "rgba(0, 0, 0, .03)",
									itemOpacity: 1,
								},
							},
						],
					},
				]}
			/>
		</div>
	);
}
