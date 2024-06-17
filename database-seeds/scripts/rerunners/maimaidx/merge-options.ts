import { Command } from "commander";
import { XMLParser } from "fast-xml-parser";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import path from "path";
import {
	CreateChartID,
	GetFreshSongIDGenerator,
	MutateCollection,
	ReadCollection,
	WriteCollection,
} from "../../util";
import { ChartDocument, Difficulties, GetGamePTConfig, SongDocument } from "tachi-common";

const VERSION_DISPLAY_NAMES = [
	"maimai",
	"maimai PLUS",
	"GreeN",
	"GreeN PLUS",
	"ORANGE",
	"ORANGE PLUS",
	"PiNK",
	"PiNK PLUS",
	"MURASAKi",
	"MURASAKi PLUS",
	"MiLK",
	"MiLK PLUS",
	"FiNALE",
	"maimaiでらっくす",
	"maimaiでらっくす PLUS",
	"Splash",
	"Splash PLUS",
	"UNiVERSE",
	"UNiVERSE PLUS",
	"FESTiVAL",
	"FESTiVAL PLUS",
	"BUDDiES",
	"BUDDiES PLUS",
];

interface IDWithDisplayName {
	id: number;
	str: string;
}

interface NotesData {
	file: {
		path: string;
	};
	isEnable: boolean;
	level: number;
	levelDecimal: number;
	notesDesigner: IDWithDisplayName;
	notesType: number;
	musicLevelID: number;
	maxNotes: number;
}

interface MusicXML {
	MusicData: {
		disable: boolean;
		name: IDWithDisplayName;
		artistName: IDWithDisplayName;
		AddVersion: IDWithDisplayName;
		genreName: IDWithDisplayName;

		notesData: {
			Notes: NotesData[];
		};
	};
}

function calculateLevel(data: Pick<NotesData, "level" | "levelDecimal">) {
	return `${data.level}${data.levelDecimal >= 6 && data.level >= 7 ? "+" : ""}`;
}

function calculateLevelNum(data: Pick<NotesData, "level" | "levelDecimal">) {
	return Number(`${data.level}.${data.levelDecimal}`);
}

const program = new Command();
program.requiredOption("-i, --input <OPTION FOLDERS...>");
program.requiredOption("-v, --version <VERSION>");

program.parse(process.argv);
const options = program.opts();

const versions = Object.keys(GetGamePTConfig("maimaidx", "Single").versions);
const isLatestVersion =
	versions.indexOf(options.version.replace(/(-intl|-omni)$/u, "")) === versions.length - 1;

const existingSongDocs: Array<SongDocument<"maimaidx">> = ReadCollection("songs-maimaidx.json");
const existingChartDocs: Array<ChartDocument<"maimaidx:Single">> =
	ReadCollection("charts-maimaidx.json");
const existingSongs = new Map(existingSongDocs.map((s) => [s.id, s]));
const existingCharts = new Map<string, ChartDocument<"maimaidx:Single">>();
const titleArtistToSongIDMap = new Map<string, number>();

for (const chart of existingChartDocs) {
	const song = existingSongs.get(chart.songID);

	if (song === undefined) {
		console.error(
			`CONSISTENCY ERROR: Chart ID ${chart.chartID} does not belong to any songs! (songID was ${chart.songID})`
		);
		process.exit(1);
	}

	existingCharts.set(`${song.title}-${song.artist}-${chart.difficulty}`, chart);
	titleArtistToSongIDMap.set(`${song.title}-${song.artist}`, song.id);
}

const parser = new XMLParser();

const newSongs: Array<SongDocument<"maimaidx">> = [];
const newCharts: Array<ChartDocument<"maimaidx:Single">> = [];

const songIDGenerator = GetFreshSongIDGenerator("maimaidx");

for (const optionFolder of options.input) {
	const musicFolder = path.join(optionFolder, "music");

	if (!existsSync(musicFolder)) {
		console.warn(`Option at ${optionFolder} does not have a "music" folder.`);
		continue;
	}

	for (const song of readdirSync(musicFolder)) {
		if (!song.startsWith("music")) {
			continue;
		}

		const songFolder = path.join(musicFolder, song);

		if (!statSync(songFolder).isDirectory()) {
			continue;
		}

		const musicXmlLocation = path.join(songFolder, "Music.xml");

		if (!existsSync(musicXmlLocation)) {
			console.warn(`Music folder at ${songFolder} does not have a Music.xml file.`);
			continue;
		}

		const data = parser.parse(readFileSync(musicXmlLocation)) as MusicXML;
		const musicData = data.MusicData;

		const inGameID = musicData.name.id;

		if (inGameID >= 100000) {
			// 100000 and above is reserved for WORLD'S END songs, don't care.
			continue;
		}

		let songID: number | undefined;

		if (inGameID === 11422) {
			// Manual override since the song's title is empty in the dataset and not
			// IDEOGRAPHIC SPACE (U+3000).
			songID = 959;
		} else {
			songID = titleArtistToSongIDMap.get(
				`${musicData.name.str}-${musicData.artistName.str}`
			);
		}

		if (songID === undefined) {
			if (musicData.disable) {
				continue;
			}

			songID = songIDGenerator();

			const displayVersion = VERSION_DISPLAY_NAMES[musicData.AddVersion.id];

			if (!displayVersion) {
				throw new Error(
					`Unknown version ID ${musicData.AddVersion.id}. Update merge-options.ts.`
				);
			}

			const songDoc: SongDocument<"maimaidx"> = {
				title: musicData.name.str,
				altTitles: [],
				searchTerms: [],
				artist: musicData.artistName.str,
				id: songID,
				data: {
					displayVersion,
					genre: musicData.genreName.str,
				},
			};

			newSongs.push(songDoc);
			titleArtistToSongIDMap.set(`${songDoc.title}-${songDoc.artist}`, songID);
		} else if (musicData.disable) {
			// Sometimes, removed songs slip into the base game,
			// and are "removed" later by marking the disable flag.
			existingChartDocs
				.filter((c) => c.songID === songID)
				.forEach((c) => {
					const versionIndex = c.versions.indexOf(options.version);

					if (versionIndex !== -1) {
						c.versions.splice(versionIndex);
					}
				});
			continue;
		}

		for (const [index, difficulty] of musicData.notesData.Notes.entries()) {
			if (!difficulty.isEnable || !existsSync(path.join(songFolder, difficulty.file.path))) {
				continue;
			}

			// There's also a sixth difficulty, "Strong", but it has always stayed disabled.
			// Tachi doesn't support it anyways.
			let difficultyName = ["Basic", "Advanced", "Expert", "Master", "Re:Master"][index];

			if (inGameID > 10000) {
				difficultyName = `DX ${difficultyName}`;
			}

			let exists: ChartDocument<"maimaidx:Single"> | undefined;

			if (inGameID === 11422) {
				exists = existingCharts.get(`-x0o0x_-${difficultyName}`);
			} else {
				exists = existingCharts.get(
					`${musicData.name.str}-${musicData.artistName.str}-${difficultyName}`
				);
			}

			const level = calculateLevel(difficulty);
			const levelNum = calculateLevelNum(difficulty);

			if (exists) {
				const versionIndex = exists.versions.indexOf(options.version);

				exists.data.inGameID = inGameID;

				if (versionIndex === -1) {
					exists.versions.push(options.version);
				}

				if (isLatestVersion) {
					exists.level = level;
					exists.levelNum = levelNum;
				}

				continue;
			}

			const chartDoc: ChartDocument<"maimaidx:Single"> = {
				chartID: CreateChartID(),
				songID,
				difficulty: difficultyName as Difficulties["maimaidx:Single"],
				isPrimary: true,
				level,
				levelNum,
				versions: [options.version],
				playtype: "Single",
				data: {
					inGameID,
				},
			};
			newCharts.push(chartDoc);
		}
	}
}

MutateCollection("songs-maimaidx.json", (songs: Array<SongDocument<"maimaidx">>) => [
	...songs,
	...newSongs,
]);

// overwrite this collection instead of mutating it
// we already know the existing chart docs and might have mutated them to
// declare the new versions, or update chart constants.
WriteCollection("charts-maimaidx.json", [...existingChartDocs, ...newCharts]);
