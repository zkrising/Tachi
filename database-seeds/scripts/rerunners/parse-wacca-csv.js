const { parse } = require("csv-parse/sync");
const fs = require("fs");
const fetch = require("node-fetch");
const { Command } = require("commander");
const { CreateChartID, ReadCollection, WriteCollection } = require("../util");
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

const titleMap = {
	"13 DONKEYS": "13 Donkeys",
	"cloud Ⅸ": "cloud IX",
};

// Converts the title on the site to a noramlized version that we
// can match against the CSV.
function siteTitleNormalize(siteTitle) {
	let normalized = decode(siteTitle.replace(/　/g, " ")).trim();

	if (normalized in titleMap) {
		normalized = titleMap[normalized];
	}

	return normalized;
}

// Note that the title in the CSV is the one we want - it's what's
// used on the actual site. However, this normalizes it so we can
// match against the broken titles on the music search site.
function csvTitleNormalize(csvTitle) {
	return csvTitle.replace(/”|“/gu, '"').replace(/’/gu, "'");
}

// we have to skip the first record because its the headers,
// and there's literally no way to change this behaviour.
for (const record of dirtyRecords.slice(1)) {
	dataMap.set(csvTitleNormalize(record[0]), record);
}

const STARTS = {
	s: Date.parse("2020-1-22"),
	lily: Date.parse("2020-9-17"),
	lilyr: Date.parse("2021-3-11"),
	reverse: Date.parse("2021-8-10"),
};

(async () => {
	const existingSongs = new Map(ReadCollection("songs-wacca.json").map((e) => [e.title, e.id]));
	const existingCharts = new Map(
		ReadCollection("charts-wacca.json").map((e) =>
			// We need to combine songID and difficulty for the key,
			// this seems like the simplest way.
			[`${e.songID} ${e.difficulty}`, e.chartID]
		)
	);

	const datum = await fetch("https://wacca.marv.jp/music/search.php", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
		},
		body: "cat=all",
	}).then((r) => r.json());

	const songs = [];
	const charts = [];

	let songID = Math.max(...existingSongs.values()) + 1;

	for (const data of datum) {
		let siteTitleNormalized = siteTitleNormalize(data.title.display);

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
		const record = dataMap.get(siteTitleNormalized);

		if (!record) {
			logger.warn(
				`Can't find record with title ${siteTitleNormalized}. Dumping potentially similar titles.\n${[
					...dataMap.keys(),
				]
					.filter((e) => e.startsWith(siteTitleNormalized[0]))
					.join("\n")}`
			);
			continue;
		}

		// Use the CSV title.
		const title = record[0];
		const siteTitle = decode(data.title.display).trim();
		const altTitles = [];
		if (title !== siteTitle) {
			// Include the title on the music site just in case.
			altTitles.push(siteTitle);
		}

		let thisSongID = songID;
		if (existingSongs.has(title)) {
			thisSongID = existingSongs.get(title);
		} else {
			songID++;
		}
		songs.push({
			id: thisSongID,
			title,
			artist: decode(data.artist.display).trim(),
			searchTerms: [],
			altTitles,
			data: {
				titleJP: decode(data.title.ruby),
				artistJP: decode(data.artist.ruby),
				genre: decode(data.category),
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

			const chartID = existingCharts.get(`${thisSongID} ${diffName}`) || CreateChartID();

			charts.push({
				songID: thisSongID,
				chartID: chartID,
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
	}

	WriteCollection("charts-wacca.json", charts);
	WriteCollection("songs-wacca.json", songs);
})();
