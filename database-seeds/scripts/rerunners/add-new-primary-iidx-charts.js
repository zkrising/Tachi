const { MutateCollection, CreateChartID } = require("../util");

const inGameID = 19017;
const tachiSongID = 1014;

const newCharts = [
	["SP", "NORMAL", 297, 3],
	["DP", "NORMAL", 316, 3],
	["DP", "ANOTHER", 1068, 10],
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
				arcChartID: null,
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
			rgcID: null,
			songID: tachiSongID,
			tierlistInfo: {},
			versions: ["29"],
		});
	}

	return charts;
});
