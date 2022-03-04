const { Command } = require("commander");
const { XMLParser } = require("fast-xml-parser");
const Encoding = require("encoding-japanese");
const fs = require("fs");
const { CreateChartID, ReadCollection, WriteCollection } = require("../util");

const VERSIONS = {
	1: "booth",
	2: "inf",
	3: "gw",
	4: "heaven",
	5: "vivid",
	6: "exceed",
};

const VERSION_DIFFICULTIES = {
	2: "INF",
	3: "GRV",
	4: "HVN",
	5: "VVD",
};

const DIFFICULTIES = {
	novice: "NOV",
	advanced: "ADV",
	exhaust: "EXH",
	maximum: "MXM",
};

const SHITTY_SJIS_OVERRIDE_TITLES = {
	1724: "Verstärkt Killer",
};

function getDifficulty(diffKey, version) {
	if (diffKey === "infinite") {
		return VERSION_DIFFICULTIES[version];
	}

	return DIFFICULTIES[diffKey];
}

function getTitle(id, title) {
	return SHITTY_SJIS_OVERRIDE_TITLES[id] || title;
}

const program = new Command();
program.option("-f, --file <XML File>");
program.parse(process.argv);
const options = program.opts();

const parser = new XMLParser({ ignoreAttributes: false });
const fileString = Encoding.convert(fs.readFileSync(options.file), {
	to: "UNICODE",
	from: "SJIS",
	type: "string",
});
const xmlData = parser.parse(fileString);

const songs = ReadCollection("songs-sdvx.json");
const charts = ReadCollection("charts-sdvx.json");

let versionAddedCount = 0;
let newChartCount = 0;

for (const music of xmlData.mdb.music) {
	const id = Number(music["@_id"]);

	const newSong = !songs.find((song) => song.id === id);
	if (newSong) {
		songs.push({
			id,
			title: getTitle(id, music.info.title_name),
			artist: music.info.artist_name,
			data: {
				displayVersion: VERSIONS[music.info.version["#text"]],
			},
			altTitles: [],
			searchTerms: [music.info.ascii.replaceAll("_", " "), music.info.title_yomigana],
		});
	}

	for (const diffKey in music.difficulty) {
		const diffData = music.difficulty[diffKey];
		const levelNum = Number(diffData.difnum["#text"]);
		if (levelNum === 0) {
			continue;
		}

		const difficulty = getDifficulty(diffKey, music.info.inf_ver["#text"]);

		const chartIndex = charts.findIndex(
			(chart) => chart.songID === id && chart.difficulty === difficulty
		);
		if (chartIndex === -1) {
			charts.push({
				chartID: CreateChartID(),
				difficulty,
				songID: id,
				playtype: "Single",
				levelNum,
				level: levelNum.toString(),
				data: {
					inGameID: id,
					arcChartID: null,
				},
				isPrimary: true,
				versions: ["konaste"],
				tierlistInfo: {},
				rgcID: null,
			});

			if (!newSong) {
				console.log(`New ${difficulty} ${levelNum} for song id ${id}`);
			}

			newChartCount++;
		} else if (!charts[chartIndex].versions.includes("konaste")) {
			charts[chartIndex].versions.push("konaste");

			versionAddedCount++;
		}
	}
}

console.log(`Added "konaste" version to ${versionAddedCount} charts.`);
console.log(`Added ${newChartCount} brand new charts.`);

WriteCollection("songs-sdvx.json", songs);
WriteCollection("charts-sdvx.json", charts);
