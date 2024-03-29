import { Command } from "commander";
import { CreateChartID, ReadCollection, WriteCollection } from "../../util";
import { ChartDocument, Difficulties, SongDocument } from "tachi-common";
import * as cheerio from "cheerio";

const SXGA_DATA_URL = "https://ongeki.sxga.jp/assets/json/music/music.json".replace("x", "e");
const CURRENT_VERSION = "brightMemory3";
const CURRENT_VERSION_PRETTY = "bright MEMORY Act.3";

type OngekiChart = ChartDocument<"ongeki:Single">;
type OngekiSong = SongDocument<"ongeki">;

interface SxgaEntry {
	date: string;
	title: string;
	artist: string;
	category: string;
	lunatic: "" | "1";
}

// Wikiwiki really sucks
const unnormalizeTitle = (title: string): string =>
	title
		.replace("...", "…")
		.replace(/:/gu, "：")
		.replace(/\(/gu, "（")
		.replace(/\)/gu, "）")
		.replace(/!/gu, "！")
		.replace(/\?/gu, "？")
		.replace(/~/gu, "～");

const scrapeWikiwiki = async (
	charts: OngekiChart[],
	songID: number,
	title: string,
	lunatic: boolean,
	unnormalized = false
) => {
	const res = await fetch(`https://wikiwiki.jp/gameongeki/${title.replace(/ /gu, "%20")}`);
	const $ = cheerio.load(await res.text());
	const tables = $("#content tbody").toArray();
	if (tables.length < 2) {
		if (unnormalized) {
			throw new Error(`${title}: Invalid wikipage: expected 2 tables, got ${tables.length}`);
		} else {
			return scrapeWikiwiki(charts, songID, unnormalizeTitle(title), lunatic, true);
		}
	}
	const diffTable = tables![1];
	const diffRows = $(diffTable).find("tr").toArray();

	const diffsToParse: Difficulties["ongeki:Single"][] = lunatic
		? ["LUNATIC"]
		: ["BASIC", "ADVANCED", "EXPERT", "MASTER"];
	for (const diff of diffsToParse) {
		const row = diffRows.find((row) => $(row.firstChild!).html() === diff);

		const level = $(row?.children[1]).html();
		const noteCountRaw = $(row?.children[2]).html();
		const bellCountRaw = $(row?.children[3]).html();
		const internalLevelRaw = $(row?.children[4]).html();

		let noteCount: number | undefined;
		let bellCount: number | undefined;
		let internalLevel: number;

		if (!level) {
			throw new Error(`${title} ${diff}: Invalid wikipage: ${diff} has no level`);
		}

		if (!noteCountRaw) {
			if (diff === "MASTER" || diff === "LUNATIC") {
				// This value is necessary for platinum delta calculation
				throw new Error(`${title} ${diff}: unknown note count`);
			} else {
				console.log(`warn: ${title} ${diff}: unknown note count`);
			}
		} else {
			noteCount = parseInt(noteCountRaw, 10);
		}
		if (!bellCountRaw) {
			console.log(`warn: ${title} ${diff}: unknown bell count`);
		} else {
			bellCount = parseInt(bellCountRaw, 10);
		}
		if (!internalLevelRaw) {
			console.log(`warn: ${title} ${diff}: unknown internal level (will be deduced)`);
			internalLevel = parseInt(level, 10);
			if (level.endsWith("+")) {
				internalLevel += 0.7;
			}
		} else {
			internalLevel = parseFloat(internalLevelRaw);
		}

		const newChart: OngekiChart = {
			difficulty: diff,
			chartID: CreateChartID(),
			songID,
			level,
			levelNum: internalLevel,
			isPrimary: true,
			playtype: "Single",
			data: {
				displayVersion: CURRENT_VERSION_PRETTY,
				totalBellCount: bellCount,
				totalNoteCount: noteCount,
			},
			versions: [CURRENT_VERSION, `${CURRENT_VERSION}Omni`],
		};

		charts.push(newChart);
	}
};

const main = async ({ date }) => {
	const charts: OngekiChart[] = ReadCollection("charts-ongeki.json");
	const songs: OngekiSong[] = ReadCollection("songs-ongeki.json");

	const sxgaEntriesRaw = await fetch(SXGA_DATA_URL);
	const sxgaEntries: SxgaEntry[] = (await sxgaEntriesRaw.json()).filter(
		(o: SxgaEntry) => o.date >= date
	);
	for (const entry of sxgaEntries) {
		const queriedDiff = entry.lunatic ? "LUNATIC" : "MASTER";
		const song = songs.find((song) => song.title === entry.title);

		console.log(`${entry.title} ${queriedDiff}`);

		if (song) {
			const chart = charts.find(
				(chart) => chart.songID === song.id && chart.difficulty === queriedDiff
			);
			if (chart) {
				console.log(`\tskipping`);
			} else {
				console.log(`\t\x1b[34mnew chart\x1b[0m`);

				scrapeWikiwiki(charts, song.id, entry.title, entry.lunatic ? true : false);
			}
		} else {
			console.log(`\t\x1b[31mnew song\x1b[0m`);

			songs.push({
				title: entry.title,
				artist: entry.artist,
				id: songs[songs.length - 1]!.id + 1,
				searchTerms: [],
				altTitles: [],
				data: {
					genre: entry.category,
				},
			});

			scrapeWikiwiki(
				charts,
				songs[songs.length - 1]!.id,
				entry.title,
				entry.lunatic ? true : false
			);
		}

		console.log("");
	}

	WriteCollection("songs-ongeki.json", songs);
	WriteCollection("charts-ongeki.json", charts);
};

new Command()
	.name("Fetch Ongeki")
	.description("Fetch new Ongeki charts.")
	.requiredOption("--date <date>", "Start date as YYYYMMDD, e.g. 20231228")
	.action(main)
	.parse();
