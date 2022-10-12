const { MutateCollection } = require("../../util");

module.exports = (idSet) =>
	MutateCollection("charts-iidx.json", (charts) => {
		for (const chart of charts) {
			if (
				idSet.includes(chart.data.inGameID) &&
				!chart.versions.includes("inf") &&
				chart.data["2dxtraSet"] === null &&
				chart.difficulty !== "LEGGENDARIA" &&
				chart.difficulty !== "BEGINNER"
			) {
				chart.versions.push("inf");
			}
		}

		return charts;
	});
