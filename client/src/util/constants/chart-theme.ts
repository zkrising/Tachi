import { Theme } from "@nivo/core";

export const TACHI_CHART_THEME: Theme = {
	background: "#2b292b",
	textColor: "#ffffff",
	fontSize: 11,
	axis: {
		domain: {
			line: {
				stroke: "#777777",
				strokeWidth: 1,
			},
		},
		ticks: {
			line: {
				stroke: "#777777",
				strokeWidth: 1,
			},
		},
	},
	grid: {
		line: {
			stroke: "#131313",
			strokeWidth: 1,
		},
	},
	crosshair: {
		line: {
			stroke: "white",
		},
	},
};
