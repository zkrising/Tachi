const { Command } = require("commander");
const { XMLParser } = require("fast-xml-parser");
const fs = require("fs");
const { MutateCollection, CreateChartID } = require("../../util");

const program = new Command();
program
	.option("-f, --file <XML File>")
	.option("-n, --name <Set Name>")
	.option("-v, --version <Version>");

program.parse(process.argv);
const options = program.opts();

if (!options.file || !options.name || !options.version) {
	throw new Error("Missing options --file, --name or --version.");
}

if (!["All Scratch", "Kichiku", "Kiraku"].includes(options.name)) {
	throw new Error(`Unexpected value for --name ${options.name}.`);
}

const parser = new XMLParser({ ignoreAttributes: false });

const data = parser.parse(fs.readFileSync(options.file));

const parsedData = [];

function SplitFervidexChartRef(ferDif) {
	let playtype;

	if (ferDif.startsWith("sp")) {
		playtype = "SP";
	} else {
		playtype = "DP";
	}

	let difficulty;

	switch (ferDif[ferDif.length - 1]) {
		case "b":
			difficulty = "BEGINNER";
			break;
		case "n":
			difficulty = "NORMAL";
			break;
		case "h":
			difficulty = "HYPER";
			break;
		case "a":
			difficulty = "ANOTHER";
			break;
		case "l":
			difficulty = "LEGGENDARIA";
			break;
		default:
			throw new Error(`Invalid fervidex difficulty of ${ferDif}`);
	}

	return { playtype, difficulty };
}

for (const info of data.entries.music) {
	const id = Number(info["@_id"]);

	if (!Array.isArray(info.chart)) {
		info.chart = [info.chart];
	}

	for (const chart of info.chart) {
		const hash = chart["@_id"];
		const diff = chart["@_type"];
		const notes = Number(chart["@_notes"]);

		const { playtype, difficulty } = SplitFervidexChartRef(diff);

		// Skip Beginner Charts since we don't track those anyways
		if (difficulty == "BEGINNER") {
			continue;
		}

		parsedData.push({
			id,
			hash,
			notes,
			playtype,
			difficulty,
		});
	}
}

MutateCollection("charts-iidx.json", (charts) => {
	for (const data of parsedData) {
		let match = false;
		let existingReference = null;
		for (const chart of charts) {
			if (chart.data.hashSHA256 === data.hash) {
				if (!chart.versions.includes(options.version)) {
					chart.versions.push(options.version);
				}
				match = true;
				break;
			} else if (
				Array.isArray(chart.data.inGameID)
					? chart.data.inGameID.includes(data.id)
					: chart.data.inGameID === data.id
			) {
				existingReference = chart;
			}
		}

		if (!match) {
			if (!existingReference) {
				console.log(`Couldn't resolve this: `, data);
				continue;
			}

			// Deprimary old charts if there are new ones
			for (const chart of charts) {
				if (
					(Array.isArray(chart.data.inGameID)
						? chart.data.inGameID.includes(data.id)
						: chart.data.inGameID === data.id) &&
					chart.difficulty === `${options.name} ${data.difficulty}` &&
					chart.playtype === data.playtype &&
					chart.data["2dxtraSet"] === options.name
				) {
					chart.isPrimary = false;
				}
			}

			charts.push({
				chartID: CreateChartID(),
				data: {
					"2dxtraSet": options.name,
					hashSHA256: data.hash,
					inGameID: data.id,
					notecount: data.notes,
					bpiCoefficient: null,
					kaidenAverage: null,
					worldRecord: null,
				},
				difficulty: `${options.name} ${data.difficulty}`,
				isPrimary: true,
				level: "?",
				levelNum: 0,
				playtype: data.playtype,
				songID: existingReference.songID,
				versions: [options.version],
			});
		}
	}

	return charts;
});
