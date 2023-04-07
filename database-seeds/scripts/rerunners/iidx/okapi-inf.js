const { MutateCollection } = require("../../util");

const inGameID = 26110;

MutateCollection("charts-iidx.json", (charts) => {
	for (const chart of charts) {
		if (
			chart.data.inGameID === inGameID &&
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
