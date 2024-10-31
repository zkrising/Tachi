import { TACHI_LINE_THEME } from "util/constants/chart-theme";
import React, { useContext } from "react";
import { ResponsiveLine } from "@nivo/line";
import { ColourConfig } from "lib/config";
import { WindowContext } from "context/WindowContext";

export default function TimelineChart({
	width = "100%",
	height = "100%",
	mobileHeight = "100%",
	mobileWidth = width,
	data,
	reverse,
	...props
}: {
	mobileHeight?: number | string;
	mobileWidth?: number | string;
	width?: number | string;
	height?: number | string;
	reverse?: boolean;
} & ResponsiveLine["props"]) {
	const {
		breakpoint: { isMd },
	} = useContext(WindowContext);
	const graphStyle = { height: isMd ? height : mobileHeight, width: isMd ? width : mobileWidth };
	if (!data[0] || data[0].data.length < 2) {
		return (
			<div className="d-flex justify-content-center align-items-center" style={graphStyle}>
				<div className="text-center">
					Not Enough Data... Yet.
					<br />
					<small className="text-body-secondary">
						(You need atleast 2 days worth of data)
					</small>
				</div>
			</div>
		);
	}
	return (
		<div style={graphStyle}>
			<ResponsiveLine
				data={data}
				margin={{ top: 40, bottom: 40, left: 60, right: 40 }}
				xScale={{ type: "time", format: "%Q" }}
				xFormat="time:%Q"
				gridXValues={3}
				motionConfig="stiff"
				crosshairType="x"
				yScale={{ type: "linear", min: "auto", max: "auto", reverse }}
				enablePoints={false}
				colors={[ColourConfig.primary]}
				useMesh={true}
				theme={TACHI_LINE_THEME}
				legends={[]}
				{...props}
			/>
		</div>
	);
}
