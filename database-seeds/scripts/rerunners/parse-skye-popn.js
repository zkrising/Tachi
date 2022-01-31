const fs = require("fs");

const { Command } = require("commander");
const { CreateChartID } = require("../util");
const path = require("path");

const program = new Command();
program.option("-f, --file <mxb-json>");

program.parse(process.argv);
const options = program.opts();

if (!options.file) {
	throw new Error(`Please specify a file with --file.`);
}

let data = JSON.parse(fs.readFileSync(options.file));

data = data.filter((e) => e !== null);

const songs = [];
const charts = [];

let songID = 1;
for (const song of data) {
	const isUpper = song.charts.some((k) => k !== null && k.filename.startsWith("exx"));
	const isUra = song.charts.some((k) => k !== null && k.filename.endsWith("_ura2"));

	let title = isUpper ? `${song.title} (UPPER)` : song.title;
	title = isUra ? `${title} (URA)` : title;

	songs.push({
		id: songID,
		title,
		artist: song.artist,
		searchTerms: [],
		altTitles: [],
		data: {
			displayVersion: null,
			genre: song.genre,
		},
	});

	for (const [index, chart] of Object.entries(song.charts)) {
		if (chart === null) {
			continue;
		}

		if (chart.difficulty.startsWith("BATTLE")) {
			continue;
		}

		charts.push({
			songID,
			chartID: CreateChartID(),
			// Turns HYPER into Hyper, but keeps EX the same.
			difficulty:
				chart.difficulty === "EX"
					? "EX"
					: chart.difficulty[0] + chart.difficulty.slice(1).toLowerCase(),
			playtype: "9B",
			level: chart.level.toString(),
			levelNum: chart.level,
			rgcID: null,
			isPrimary: true,
			data: {
				hashSHA256: chart.hash,
				inGameID: index,
			},
			tierlistInfo: {},
			versions: ["peace"],
		});
	}

	songID++;
}

// fs.writeFileSync(path.join(__dirname, "../../collections/charts-popn.json"), JSON.stringify(charts, null, "\t"));
fs.writeFileSync(
	path.join(__dirname, "../../collections/songs-popn.json"),
	JSON.stringify(songs, null, "\t")
);
