import { Theme } from "@nivo/core";

export const TACHI_CHART_THEME: Theme = {
	textColor: "",
	fontSize: 11,
	axis: {
		domain: {
			line: {
				stroke: "var(--bs-secondary)",
				strokeWidth: 1,
			},
		},
		ticks: {
			line: {
				stroke: "var(--bs-secondary)",
				strokeWidth: 1,
			},
		},
	},
	grid: {
		line: {
			stroke: "var(--bs-body-bg)",
			strokeWidth: 1,
		},
	},
	crosshair: {
		line: {
			stroke: "var(--bs-body-color)",
		},
	},
};
