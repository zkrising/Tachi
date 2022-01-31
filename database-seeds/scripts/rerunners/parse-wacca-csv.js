const { parse } = require("csv-parse/sync");
const fs = require("fs");
const fetch = require("node-fetch");
const { Command } = require("commander");
const { CreateChartID } = require("../util");
const path = require("path");
const { decode } = require("html-entities");
const logger = require("../logger");

const program = new Command();

// https://github.com/shimmand/waccaSupportTools/blob/main/analyzePlayData/chartsTable.csv
program.option("-f, --file <wacca.csv>");

program.parse(process.argv);
const options = program.opts();

if (!options.file) {
	throw new Error("No wacca.csv provided.");
}

const dirtyRecords = parse(fs.readFileSync(options.file), {});

// 0-song-title
// 1-normal-level
// 2-normal-const
// 3-normal-is-newer
// 4-hard-level
// 5-hard-const
// 6-hard-is-newer
// 7-expert-level
// 8-expert-const
// 9-expert-is-newer
// 10-inferno-level
// 11-inferno-const
// 12-inferno-is-newer

const dataMap = new Map();

// we have to skip the first record because its the headers,
// and there's literally no way to change this behaviour.
for (const record of dirtyRecords.slice(1)) {
	dataMap.set(record[0].replace(/”|“/g, '"').replace(/’/g, "'"), record);
}

const STARTS = {
	s: Date.parse("2020-1-22"),
	lily: Date.parse("2020-9-17"),
	lilyr: Date.parse("2021-3-11"),
	reverse: Date.parse("2021-8-10"),
};

(async () => {
	const datum = await fetch("https://wacca.marv.jp/music/search.php", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
		},
		body: "cat=all",
	}).then((r) => r.json());

	const songs = [];
	const charts = [];

	let songID = 1;

	for (const data of datum) {
		let prettiedTitle = decode(data.title.display.replace(/　/g, " ")).trim();

		// This song got its title changed.
		// No, I don't know why.
		if (prettiedTitle === "13 DONKEYS") {
			prettiedTitle = "13 Donkeys";
		}

		const time = Date.parse(data.release_date);
		let ver;

		if (time < STARTS.s) {
			ver = "wacca";
		} else if (time < STARTS.lily) {
			ver = "s";
		} else if (time < STARTS.lilyr) {
			ver = "lily";
		} else if (time < STARTS.reverse) {
			ver = "lilyr";
		} else {
			ver = "reverse";
		}

		logger.verbose(`Parsed as ${ver}.`);

		// re-screw "'s to their shift-jis equivalent, because it seems like decoding
		// &quot; is locale specific. Thanks.
		const record = dataMap.get(prettiedTitle);

		if (!record) {
			logger.warn(
				`Can't find record with title ${prettiedTitle}. Dumping potentially similar titles.\n${[
					...dataMap.keys(),
				]
					.filter((e) => e.startsWith(prettiedTitle[0]))
					.join("\n")}`
			);
			continue;
		}

		songs.push({
			id: songID,
			title: prettiedTitle,
			artist: decode(data.artist.display).trim(),
			searchTerms: [],
			altTitles: [],
			data: {
				titleJP: data.title.ruby,
				artistJP: data.artist.ruby,
				genre: data.category,
				displayVersion: ver,
			},
		});

		for (let i = 0; i < 4; i++) {
			const diff = record[1 + i * 3];
			const [diffName, level] = diff.split(" ");
			const levelNum = Number(record[2 + i * 3]);
			const isNew = record[3 + i * 3];

			if (!levelNum) {
				continue;
			}

			charts.push({
				songID,
				chartID: CreateChartID(),
				rgcID: null,
				level,
				levelNum,
				isPrimary: true,
				difficulty: diffName,
				playtype: "Single",
				data: {
					isHot: isNew === "true",
				},
				tierlistInfo: {},
				versions: ["reverse"],
			});
		}

		songID++;
	}

	fs.writeFileSync(
		path.resolve(__dirname, "../../collections/charts-wacca.json"),
		JSON.stringify(charts, null, "\t")
	);
	fs.writeFileSync(
		path.resolve(__dirname, "../../collections/songs-wacca.json"),
		JSON.stringify(songs, null, "\t")
	);
})();
