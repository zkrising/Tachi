import { Command } from "commander";
import { XMLParser } from "fast-xml-parser";
import fs from "fs";
import { decode } from "iconv-lite";
import { ChartDocument, Difficulties, SongDocument, integer } from "tachi-common";
import {
	CreateChartID,
	GetFreshSongIDGenerator,
	MutateCollection,
	ReadCollection,
	WriteCollection,
} from "../../util";

const program = new Command();
program.requiredOption("-i, --input <music_db.xml>");
program.requiredOption("-v, --version <the version this mdb is for, booth, inf, heaven, etc.>");

program.parse(process.argv);
const options = program.opts();

const parser = new XMLParser({ ignoreAttributes: false });

const sjisContent = fs.readFileSync(options.input);
const utf8Content = decode(sjisContent, "shift-jis");

const data = parser.parse(utf8Content);

interface XMLText<T> {
	"#text": T;
}

interface MDBChart {
	difnum: XMLText<number>;
	illustrator: string;
	effected_by: string;
}

interface MDBEntry {
	info: {
		label: string;
		title_name: string;
		title_yomigana: string;
		artist_name: string;
		artist_yomigana: string;
		inf_ver: XMLText<number>;
		ascii: string;
		version: XMLText<number>;
	};
	difficulty: {
		novice?: MDBChart;
		advanced?: MDBChart;
		exhaust?: MDBChart;
		infinite?: MDBChart;
		maximum?: MDBChart;
	};
	"@_id": string;
}

const existingChartDocs = ReadCollection("charts-sdvx.json");

const inGameIDToSongIDMap = new Map<number, number>();
const existingCharts = new Map<string, ChartDocument<"sdvx:Single">>();

for (const chart of existingChartDocs) {
	inGameIDToSongIDMap.set(chart.data.inGameID, chart.songID);
	existingCharts.set(`${chart.data.inGameID}-${chart.difficulty}`, chart);
}

const getNewSongID = GetFreshSongIDGenerator("sdvx");

function convertVersion(input: number) {
	switch (input) {
		case 1:
			return "booth";
		case 2:
			return "inf";
		case 3:
			return "gw";
		case 4:
			return "heaven";
		case 5:
			return "vivid";
		case 6:
			return "exceed";
	}

	throw new Error(
		`Unknown first version ${input}, can't convert this into one of Tachi's SDVX version names. Consider updating the merge-mdb.ts script.`
	);
}

function convertDiff(
	diffString: keyof MDBEntry["difficulty"],
	infVer: integer
): Difficulties["sdvx:Single"] {
	switch (diffString) {
		case "novice":
			return "NOV";
		case "advanced":
			return "ADV";
		case "exhaust":
			return "EXH";
		case "maximum":
			return "MXM";
		case "infinite":
			if (infVer === 2) {
				return "INF";
			} else if (infVer === 3) {
				return "GRV";
			} else if (infVer === 4) {
				return "HVN";
			} else if (infVer === 5) {
				return "VVD";
			} else if (infVer === 6) {
				return "XCD";
			}

			throw new Error(
				`Unknown inf_ver ${infVer}. Cannot interpret the real difficulty of this chart!`
			);
	}
}

const newSongs: Array<SongDocument<"sdvx">> = [];
const newCharts: Array<ChartDocument<"sdvx:Single">> = [];

// anything we don't want to include?
const blacklist = [1259, 1491, 1438, 1490];

// these chars are nonsensically remapped in the xml
// go figure
const InsaneCharRebinds = {
	"‾": "~",
	"〜": "～",
	䧺: "ê",
	彜: "ū",
	曦: "à",
	曩: "è",
	躔: "🐾",
	騫: "á",
	驩: "Ø",
	驫: "ā",
	驪: "ō",
	骭: "ü",
	鬯: "ī",
	黷: "ē",
	齣: "Ú",
	齧: "Ä",
	霻: "♠",
	齪: "♣",
	鑈: "♦",
	齲: "♥",
	齶: "♡",
	齷: "é",
	罇: "ê",
	隍: "Ü",
	趁: "Ǣ",
	鬮: "¡",
	雋: "Ǜ",
	魄: "♃",
	鬥: "Ã",
	鬆: "Ý",
	瀑: "À",
	疉: "Ö",
	鑒: "₩",
};

// apply char rebinds
function fixString(string: string): string {
	return string
		.split("")
		.map((e) => InsaneCharRebinds[e] ?? e)
		.join("");
}

for (const entry of data.mdb.music as Array<MDBEntry>) {
	const inGameID = Number(entry["@_id"]);

	if (blacklist.includes(inGameID)) {
		continue;
	}

	let songID = inGameIDToSongIDMap.get(inGameID);

	if (songID === undefined) {
		const fixedTitle = fixString(entry.info.title_name);

		const altTitles: string[] = [];

		if (fixedTitle !== entry.info.title_name) {
			altTitles.push(entry.info.title_name);
		}

		// new song, add to seeds.
		const songDoc: SongDocument<"sdvx"> = {
			title: fixedTitle,
			artist: fixString(entry.info.artist_name),
			searchTerms: [entry.info.ascii],
			altTitles,
			id: getNewSongID(),
			data: {
				displayVersion: convertVersion(entry.info.version["#text"]),
			},
		};

		newSongs.push(songDoc);
		inGameIDToSongIDMap.set(inGameID, songDoc.id);

		songID = songDoc.id;
	}

	for (const diff of ["novice", "advanced", "exhaust", "infinite", "maximum"] as const) {
		const maybeEntry = entry.difficulty[diff];

		if (!maybeEntry) {
			continue;
		}

		if (diff === "infinite" && entry.info.inf_ver["#text"] === 0) {
			continue;
		}

		const difficulty = convertDiff(diff, entry.info.inf_ver["#text"]);

		const exists = existingCharts.get(`${inGameID}-${difficulty}`);

		// for existing charts, add this version if we need to
		if (exists) {
			if (!exists.versions.includes(options.version)) {
				exists.versions.push(options.version);
			}

			continue;
		}

		if (maybeEntry.difnum["#text"] === 0) {
			// no chart if diffnum is 0
			continue;
		}

		const chartDoc: ChartDocument<"sdvx:Single"> = {
			chartID: CreateChartID(),
			songID,
			difficulty,
			isPrimary: true,
			level: maybeEntry.difnum["#text"].toString(),
			levelNum: maybeEntry.difnum["#text"],
			versions: [options.version],
			playtype: "Single",
			data: {
				inGameID,
			},
		};
		// new chart
		newCharts.push(chartDoc);
	}
}

MutateCollection("songs-sdvx.json", (songs) => [...songs, ...newSongs]);

// overwrite this collection instead of mutating it
// we already know the existing chart docs and might have mutated them to
// declare the new versions.
WriteCollection("charts-sdvx.json", [...existingChartDocs, ...newCharts]);
