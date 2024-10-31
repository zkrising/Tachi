const { MutateCollection } = require("../../util");

function idMatch(idSet, inGameID) {
	if (Array.isArray(inGameID)) {
		inGameID.forEach((id) => {
			if (idSet.includes(id)) {
				return true;
			}
		});
	} else {
		if (idSet.includes(inGameID)) {
			return true;
		}
	}
	return false;
}

module.exports = (idSet) =>
	MutateCollection("charts-iidx.json", (charts) => {
		for (const chart of charts) {
			if (
				idMatch(idSet, chart.data.inGameID) &&
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
