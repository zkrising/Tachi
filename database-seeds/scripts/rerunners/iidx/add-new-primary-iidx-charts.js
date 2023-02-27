const { MutateCollection, CreateChartID } = require("../../util");

const inGameID = 30091;
const tachiSongID = 2203;

const newCharts = [
	["SP", "NORMAL", 427, 4],
	["SP", "HYPER", 880, 8],
	["SP", "ANOTHER", 1230, 10],
	["DP", "NORMAL", 446, 4],
	["DP", "HYPER", 882, 8],
	["DP", "ANOTHER", 1271, 10],
];

const shouldBeDeprimaried = (c) =>
	newCharts.map((e) => `${e[0]}-${e[1]}`).includes(`${c.playtype}-${c.difficulty}`);

MutateCollection("charts-iidx.json", (charts) => {
	for (const chart of charts) {
		if (chart.data.inGameID === inGameID && shouldBeDeprimaried(chart)) {
			chart.isPrimary = false;
		}
	}

	for (const [playtype, difficulty, notecount, level] of newCharts) {
		charts.push({
			chartID: CreateChartID(),
			data: {
				"2dxtraSet": null,
				hashSHA256: null,
				inGameID,
				bpiCoefficient: null,
				kaidenAverage: null,
				worldRecord: null,
				notecount,
			},
			difficulty,
			playtype,
			isPrimary: true,
			level: level.toString(),
			levelNum: level,
			songID: tachiSongID,
			versions: ["30", "inf"],
		});
	}

	return charts;
});
