import { Command } from "commander";
import { XMLParser } from "fast-xml-parser";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import path from "path";
import { CreateChartID, MutateCollection, ReadCollection, WriteCollection } from "../../util";
import { ChartDocument, Difficulties, GetGamePTConfig, SongDocument } from "tachi-common";
import { CreateLogger } from "mei-logger";

const logger = CreateLogger("chunithm/merge-options");

const OMNIMIX_OPTION_NAMES = ["AOMN", "AOLD", "AKON"];
const VERSIONS = [
	"chuni",
	"chuniplus",
	"air",
	"airplus",
	"star",
	"starplus",
	"amazon",
	"amazonplus",
	"crystal",
	"crystalplus",
	"paradise",
	"paradiselost",
	"new",
	"newplus",
	"sun",
	"sunplus",
	"luminous",
	"luminousplus",
];

interface IDWithDisplayName {
	id: number;
	str: string | number; // "39" -> 39, fast-xml-parser things
	data: string;
}

interface MusicFumenData {
	type: IDWithDisplayName;
	enable: boolean;
	level: number;
	levelDecimal: number;
	notesDesigner: string;
	defaultBpm: number;
}

interface MusicXML {
	MusicData: {
		disableFlag: boolean;
		name: IDWithDisplayName;
		artistName: IDWithDisplayName;
		releaseTagName: IDWithDisplayName;

		// I know it's supposed to be a list, but CHUNITHM has never had multi-genre songs
		// and also the XML parser returns it as an object.
		genreNames: {
			list: {
				StringID: IDWithDisplayName;
			};
		};

		fumens: {
			MusicFumenData: MusicFumenData[];
		};
	};
}

function calculateLevel(data: Pick<MusicFumenData, "level" | "levelDecimal">) {
	return `${data.level}${data.levelDecimal >= 50 ? "+" : ""}`;
}

function calculateLevelNum(data: Pick<MusicFumenData, "level" | "levelDecimal">) {
	return Number(`${data.level}.${data.levelDecimal}`);
}

if (require.main !== module) {
	throw new Error(
		`This is a script. It should be ran directly from the command line with ts-node.`
	);
}

const program = new Command()
	.requiredOption(
		"-i, --input <OPTIONS DIRS...>",
		"The options directories of your CHUNITHM install. Typically App/data and Option."
	)
	.requiredOption("-v, --version <VERSION>", "The version of this CHUNITHM install.")
	.option("-f, --force", "Forces overwrites where it shouldn't be done automatically.")
	.parse(process.argv);
const options = program.opts();

const baseVersion = options.version.replace(/(-intl|-omni)$/u, "");
const tachiVersions = Object.keys(GetGamePTConfig("chunithm", "Single").versions);

if (!VERSIONS.includes(baseVersion)) {
	throw new Error(
		`Invalid base version ${baseVersion}. Expected any of ${VERSIONS.join(
			","
		)}. Update the VERSIONS array in seeds/scripts/rerunners/chunithm/merge-options.ts.`
	);
}

if (!tachiVersions.includes(options.version)) {
	throw new Error(
		`Invalid version ${options.version}. Expected any of ${tachiVersions.join(
			","
		)}. If you're adding a new version, go update common/src/config/game-config/chunithm.ts.`
	);
}

const isOmnimixVersion = /-omni$/u.test(options.version);
const isLatestVersion = VERSIONS.indexOf(baseVersion) === VERSIONS.length - 1;

const existingSongDocs: Array<SongDocument<"chunithm">> = ReadCollection("songs-chunithm.json");
const existingChartDocs: Array<ChartDocument<"chunithm:Single">> =
	ReadCollection("charts-chunithm.json");

const songMap = new Map(existingSongDocs.map((s) => [s.id, s]));
const songTitleMap = new Map(existingSongDocs.map((s) => [s.title, s]));
const inGameIDToSongIDMap = new Map<number, number>();
const existingCharts = new Map<string, ChartDocument<"chunithm:Single">>();

for (const chart of existingChartDocs) {
	inGameIDToSongIDMap.set(chart.data.inGameID, chart.songID);
	existingCharts.set(`${chart.data.inGameID}-${chart.difficulty}`, chart);
}

const parser = new XMLParser();

const newSongs: Array<SongDocument<"chunithm">> = [];
const newCharts: Array<ChartDocument<"chunithm:Single">> = [];

for (const optionsDir of options.input) {
	for (const option of readdirSync(optionsDir)) {
		if (!isOmnimixVersion && OMNIMIX_OPTION_NAMES.includes(option)) {
			logger.warn(
				`Ignoring omnimix option ${option} because the version specified is not an omnimix version.`
			);
			continue;
		}

		if (!/[A-Z]\d{3}/u.test(option) && !OMNIMIX_OPTION_NAMES.includes(option)) {
			continue;
		}

		const optionDir = path.join(optionsDir, option);
		const musicsDir = path.join(optionDir, "music");

		if (!statSync(optionDir).isDirectory()) {
			continue;
		}

		if (!existsSync(musicsDir) || !statSync(musicsDir).isDirectory()) {
			logger.warn(`Option at ${optionDir} does not have a "music" directory.`);
			continue;
		}

		logger.info(`Scanning music directory ${musicsDir} for songs.`);

		for (const music of readdirSync(musicsDir)) {
			const musicDir = path.join(musicsDir, music);

			if (!/music\d+$/u.test(music)) {
				continue;
			}

			if (!statSync(musicDir).isDirectory()) {
				logger.warn(`Ignoring ${musicDir} because it is not a directory.`);
				continue;
			}

			const musicXmlLocation = path.join(musicDir, "Music.xml");

			if (!existsSync(musicXmlLocation) || !statSync(musicXmlLocation).isFile()) {
				logger.warn(`Music directory at ${musicDir} does not have a Music.xml file.`);
				continue;
			}

			const data = parser.parse(readFileSync(musicXmlLocation)) as MusicXML;
			const musicData = data.MusicData;
			const inGameID = musicData.name.id;

			if (inGameID >= 8000 || inGameID === 50 || inGameID === 81) {
				// Ignoring WORLD'S END charts, the basic tutorial chart,
				// and the master tutorial chart.
				continue;
			}

			let tachiSongID = inGameIDToSongIDMap.get(inGameID);

			// Has this song been disabled in-game?
			if (musicData.disableFlag) {
				if (tachiSongID !== undefined) {
					logger.info(
						`Removing charts of song ${musicData.artistName.str} - ${musicData.name.str} (ID ${tachiSongID}) from version ${options.version}, because disableFlag is enabled.`
					);

					existingChartDocs
						.filter((c) => c.songID === tachiSongID)
						.forEach((c) => {
							const index = c.versions.indexOf(options.version);

							if (index !== -1) {
								c.versions.splice(index, 1);
							}
						});
				}

				continue;
			}

			// New song?
			if (tachiSongID === undefined) {
				const existingTitle = songTitleMap.get(musicData.name.str.toString());

				if (existingTitle) {
					logger.warn(
						`A song called ${musicData.name.str} already exists in songs-chunithm (ID ${existingTitle.id}). Is this a duplicate with a given inGameID?`
					);

					if (options.force) {
						logger.warn("--force was requested, adding this song anyways.");
					} else {
						logger.warn("Must be resolved manually. Use --force to overwrite anyways.");
						continue;
					}
				}

				tachiSongID = musicData.name.id;

				const displayVersion = VERSIONS[musicData.releaseTagName.id];

				if (!displayVersion) {
					throw new Error(
						`Unknown version ID ${musicData.releaseTagName.id}. Update seeds/scripts/rerunners/chunithm/merge-options.ts.`
					);
				}

				const songDoc: SongDocument<"chunithm"> = {
					title: musicData.name.str.toString(),
					altTitles: [],
					searchTerms: [],
					artist: musicData.artistName.str.toString(),
					id: tachiSongID,
					data: {
						displayVersion,
						genre: musicData.genreNames.list.StringID.str.toString(),
					},
				};

				newSongs.push(songDoc);
				inGameIDToSongIDMap.set(inGameID, tachiSongID);
				songMap.set(tachiSongID, songDoc);

				logger.info(`Added new song ${songDoc.artist} - ${songDoc.title}.`);
			} else if (!songMap.has(tachiSongID)) {
				throw new Error(
					`CONSISTENCY ERROR: Song ID ${tachiSongID} does not belong to any songs!`
				);
			}

			for (const difficulty of musicData.fumens.MusicFumenData) {
				const difficultyName = difficulty.type.data;

				const exists = existingCharts.get(`${inGameID}-${difficultyName}`);
				const level = calculateLevel(difficulty);
				const levelNum = calculateLevelNum(difficulty);

				if (exists) {
					const displayName = `${musicData.artistName.str} - ${musicData.name.str} [${difficultyName}] (${exists.chartID})`;
					const versionIndex = exists.versions.indexOf(options.version);

					if (!difficulty.enable) {
						if (versionIndex !== -1) {
							logger.info(
								`Removing ${displayName} from version ${options.version} because it has been disabled.`
							);
							exists.versions.splice(versionIndex, 1);
						}

						continue;
					}

					if (versionIndex === -1) {
						logger.info(`Adding ${displayName} to version ${options.version}.`);
						exists.versions.push(options.version);
					}

					if (isLatestVersion && exists.level !== level) {
						logger.info(
							`Chart ${displayName} has had a level change: ${exists.level} -> ${level}`
						);
						exists.level = level;
					}

					if (isLatestVersion && exists.levelNum !== levelNum) {
						logger.info(
							`Chart ${displayName} has had a levelNum change: ${exists.levelNum} -> ${levelNum}`
						);
						exists.levelNum = levelNum;
					}

					continue;
				}

				if (!difficulty.enable) {
					continue;
				}

				if (difficultyName === "WORLD'S END") {
					logger.warn(
						`Song ${musicData.artistName.str} - ${musicData.name.str} (inGameID=${musicData.name.id}) contains a WORLD'S END chart, which should be impossible. Refusing to process this difficulty.`
					);
					continue;
				}

				const chartDoc: ChartDocument<"chunithm:Single"> = {
					chartID: CreateChartID(),
					songID: tachiSongID,
					difficulty: difficultyName as Difficulties["chunithm:Single"],
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

				logger.info(
					`Added chart ${musicData.artistName.str} - ${musicData.name.str} [${difficultyName}] (${chartDoc.chartID}).`
				);
			}
		}
	}
}

MutateCollection("songs-chunithm.json", (songs: Array<SongDocument<"chunithm">>) => [
	...songs,
	...newSongs,
]);

// overwrite this collection instead of mutating it
// we already know the existing chart docs and might have mutated them to
// declare the new versions, or update chart constants.
WriteCollection("charts-chunithm.json", [...existingChartDocs, ...newCharts]);
