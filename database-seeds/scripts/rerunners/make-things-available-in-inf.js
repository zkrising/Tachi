const { MutateCollection } = require("../util");

module.exports = (idSet) => {
	return MutateCollection("charts-iidx.json", (charts) => {
		for (const chart of charts) {
			if (idSet.includes(chart.data.inGameID) && !chart.versions.includes("inf")) {
				chart.versions.push("inf");
			}
		}

		return charts;
	});
}