const fs = require("fs");

const { Command } = require("commander");
const {
	CreateChartID,
	ReadCollection,
	GetFreshSongIDGenerator: GetFreshScoreIDGenerator,
	WriteCollection,
} = require("../../util");

const program = new Command();
program.requiredOption("-f, --file <mxb-json>");
program.requiredOption("-v, --version <name of the version this mxb is from>");

program.parse(process.argv);
const options = program.opts();

const data = JSON.parse(fs.readFileSync(options.file));

const curCharts = ReadCollection("charts-popn.json");

const existingSongs = new Map(curCharts.map((e) => [e.data.inGameID, e.songID]));
const existingCharts = new Map(curCharts.map((e) => [e.data.hashSHA256, e]));

const songs = [];
const charts = [];

const getNewSongID = GetFreshScoreIDGenerator("popn");

for (const song of data) {
	// some datapoints might be null
	if (song === null) {
		continue;
	}

	const index = song.music_entry;

	const isUpper = song.charts.some((k) => k !== null && k.filename.startsWith("exx"));
	const isUra = song.charts.some((k) => k !== null && k.filename.endsWith("_ura2"));

	let title = isUpper ? `${song.title} (UPPER)` : song.title;
	title = isUra ? `${title} (URA)` : title;

	let songID = existingSongs.get(index);

	if (!songID) {
		songID = getNewSongID();
		songs.push({
			id: songID,
			title,
			artist: song.artist,
			searchTerms: [],
			altTitles: [],
			data: {
				displayVersion: null,
				genre: song.genre,
				genreEN: null,
			},
		});
	}

	for (const chart of song.charts) {
		if (chart === null) {
			continue;
		}

		if (chart.difficulty.startsWith("BATTLE")) {
			continue;
		}

		const existingChart = existingCharts.get(chart.hash);
		if (existingChart) {
			if (!existingChart.versions.includes(options.version)) {
				existingChart.versions.push(options.version);
			}

			// don't add a new chart, just update versions
			continue;
		}

		// try to find the chart anyway (match inGameID, difficulty and level)
		const existingChartManual = curCharts.find(
			(curchart) =>
				curchart.data.inGameID === song.music_entry &&
				curchart.difficulty === chart.difficulty &&
				curchart.levelNum === chart.level
		);
		if (existingChartManual) {
			// it means the chart hash has changed, but the chart did not get rerated.
			console.warn(
				`${song.title} [${chart.difficulty} ${chart.level}] has changed hash but has not been rerated. Make sure to check if the chart has changed or not!`
			);
			if (!existingChartManual.versions.includes(options.version)) {
				existingChartManual.versions.push(options.version);
			}
			if (Array.isArray(existingChartManual.data.hashSHA256)) {
				existingChartManual.data.hashSHA256.push(chart.hash);
			} else {
				const newHashes = [existingChartManual.data.hashSHA256, chart.hash];
				existingChartManual.data.hashSHA256 = newHashes;
			}
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
			isPrimary: true,
			data: {
				hashSHA256: chart.hash,
				inGameID: index,
			},
			versions: [options.version],
		});
	}
}

const curSongs = ReadCollection("songs-popn.json");

WriteCollection("songs-popn.json", [...curSongs, ...songs]);
WriteCollection("charts-popn.json", [...existingCharts.values(), ...charts]);
