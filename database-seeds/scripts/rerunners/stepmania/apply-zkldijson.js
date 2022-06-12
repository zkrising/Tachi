const { CreateChartID, MutateCollection, ReadCollection } = require("../../util");
const { Command } = require("commander");
const fs = require("fs");

const program = new Command();
program.option("-f, --file <zkldi.json>");
program.option("-a, --append");

program.parse(process.argv);
const options = program.opts();

const data = JSON.parse(fs.readFileSync(options.file, "utf-8"));

let freshID = options.append ? ReadCollection("songs-itg.json").length : 1;

const songs = [];
const charts = [];

const ids = {};
const defs = {};

for (const [key, d] of Object.entries(data)) {
	const [gamemode, pack, filename, diff] = key.split("/");

	if (gamemode !== "Dance_Single") {
		continue;
	}

	let eastCoast = false;
	// only parse these for now
	if (pack.startsWith("ECS") && !pack.startsWith("ECS7")) {
		eastCoast = true;
	} else if (pack.startsWith("Stamina RPG")) {
		eastCoast = true;
	} else if (pack.startsWith("The Starter Pack of Stamina")) {
		eastCoast = false;
	} else {
		continue;
	}

	let difficulty = d.difficulty.split("_")[1];

	let title;

	if (eastCoast) {
		// parses
		// [16] [160] Song Title (Hard)
		// into a real form
		// but obviously dont parse
		// [16] [160] Song Title (Restep)
		// into assuming Restep is a difficulty name
		// lil b was right
		const fuckTheEastCoast = d.title.match(
			/^\[\d+\] \[\d+\] (.+?)(?: \((Beginner|Easy|Normal|Hard)\))?$/u
		);

		const [_, parsedTitle, weirdDiff] = fuckTheEastCoast;

		title = parsedTitle;

		if (weirdDiff) {
			difficulty = weirdDiff;
		}
	} else {
		title = d.title;
	}

	const maybeUniqueSongID = `${d.artist}-nobodywillbreakthis-${title}-${d.subtitle}`;

	if (ids[maybeUniqueSongID] === undefined) {
		ids[maybeUniqueSongID] = freshID;

		let subtitle = d.subtitle;
		if (subtitle === "For Business") {
			subtitle = `FB ${d.displayBPM[0]}`;
		} else if (subtitle === "For Pleasure") {
			subtitle = `FP ${d.displayBPM[0]}`;
		}

		songs.push({
			id: freshID,
			title,
			artist: d.artist,
			searchTerms: [],
			altTitles: [],
			data: {
				subtitle,
			},
		});

		freshID++;
	}

	if (defs[d.chartHash]) {
		// already got smth for this chart hash
		continue;
	}

	defs[d.chartHash] = true;

	charts.push({
		chartID: CreateChartID(),
		rgcID: null,
		songID: ids[maybeUniqueSongID],
		level: d.level.toString(),
		levelNum: d.level,
		isPrimary: true,
		difficulty: d.chartHash,
		playtype: "Stamina",
		tierlistInfo: {},
		versions: [],
		data: {
			difficultyTag: difficulty,
			chartHash: d.chartHash,
			tech: d.tech,
			breakdown: d.breakdown,
			charter: d.charter,
			displayBPM: d.displayBPM[0],
			length: d.length,
		},
	});
}

if (options.append) {
	MutateCollection("songs-itg.json", (oldSongs) => [...oldSongs, ...songs]);
	MutateCollection("charts-itg.json", (oldCharts) => [...oldCharts, ...charts]);
} else {
	MutateCollection("songs-itg.json", () => songs);
	MutateCollection("charts-itg.json", () => charts);
}
