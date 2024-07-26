import { XMLParser } from "fast-xml-parser";
import { CreateChartID, MutateCollection, ReadCollection, WriteCollection } from "../../util";
import {
	ChartDocument,
	Difficulties,
	type GameConfig,
	GetGameConfig,
	Playtypes,
	SongDocument,
	Versions,
} from "tachi-common";
import { DDR_FLARE_CATEGORIES } from "tachi-common/js/config/game-support/ddr";
import fs from "fs";

const gameConfig = GetGameConfig("ddr") as GameConfig<"ddr">;

interface XMLMusic {
	mcode: number;
	basename: string;
	title: string;
	title_yomi: string;
	artist: string;
	bpmmax: number;
	series: number;
	bemaniflag: number;
	limited_cha: number;
	diffLv: string;
}

const DIFFICULTIES: Array<Difficulties["ddr:SP" | "ddr:DP"]> = [
	"BEGINNER",
	"BASIC",
	"DIFFICULT",
	"EXPERT",
	"CHALLENGE",
];

const parser = new XMLParser();

function seriesToFlareCategory(series: number) {
	if (!series) {
		return DDR_FLARE_CATEGORIES.enum.NONE;
	}
	// Before X3 vs 2nd MIX
	if (series <= 13) {
		return DDR_FLARE_CATEGORIES.enum.CLASSIC;
	}
	// Between 2013 and A
	if (series > 13 && series <= 17) {
		return DDR_FLARE_CATEGORIES.enum.WHITE;
	}
	// Between A20 and WORLD
	if (series > 17 && series <= 20) {
		return DDR_FLARE_CATEGORIES.enum.GOLD;
	}
	return DDR_FLARE_CATEGORIES.enum.NONE;
}

function buildSong(music: XMLMusic): SongDocument<"ddr"> {
	return {
		artist: `${music.artist}`,
		title: `${music.title}`,
		id: music.mcode,
		data: {
			inGameID: music.mcode,
			flareCategory: seriesToFlareCategory(music.series),
		},
		altTitles: [],
		searchTerms: [],
	};
}

function buildChart(
	music: XMLMusic,
	playtype: Playtypes["ddr"],
	difficulty: Difficulties["ddr:SP" | "ddr:DP"],
	version: Versions["ddr:SP" | "ddr:DP"]
): ChartDocument<"ddr:SP" | "ddr:DP"> {
	const splitDiff = music.diffLv.split(" ");
	const diffIndex = (playtype === "SP" ? 0 : 5) + DIFFICULTIES.indexOf(difficulty);
	return {
		chartID: CreateChartID(),
		songID: music.mcode,
		difficulty: difficulty,
		isPrimary: true,
		level: splitDiff[diffIndex]!,
		levelNum: parseInt(splitDiff[diffIndex]!, 10),
		playtype: playtype,
		versions: [version],
		data: {
			inGameID: music.mcode,
		},
	};
}

function parseGameData(version: Versions["ddr:SP" | "ddr:DP"]) {
	const songs = ReadCollection("songs-ddr.json");
	const existingChartDocs = ReadCollection("charts-ddr.json");
	const existingCharts = new Map<string, ChartDocument<"ddr:SP" | "ddr:DP">>();
	for (const chart of existingChartDocs) {
		existingCharts.set(`${chart.data.inGameID}-${chart.difficulty}-${chart.playtype}`, chart);
	}
	const gameData: XMLMusic[] = parser.parse(fs.readFileSync("musicdb.xml")).mdb.music;

	const newSongs: SongDocument<"ddr">[] = [];
	const newCharts: ChartDocument<"ddr:SP" | "ddr:DP">[] = [];
	for (const music of gameData) {
		const song = songs.find((s: SongDocument<"ddr">) => s.data.inGameID === music.mcode);
		if (!song) {
			newSongs.push(buildSong(music));
		} else if (!song.versions.includes(version)) {
			song.versions.push(version);
		}
		const splitDiff = music.diffLv.split(" ");
		for (let i = 0; i < 10; i++) {
			if (parseInt(splitDiff[i]!, 10) > 0) {
				const playtype = gameConfig.playtypes.at(Math.floor(i / 5))!;
				const difficulty = DIFFICULTIES.at(i % 5)!;
				const exists = existingCharts.get(`${music.mcode}-${difficulty}-${playtype}`);
				if (exists) {
					if (!exists.versions.includes(version)) {
						exists.versions.push(version);
					}

					exists.level = splitDiff[i]!;
					exists.levelNum = parseInt(splitDiff[i]!, 10);

					continue;
				}
				newCharts.push(buildChart(music, playtype, difficulty, version));
			}
		}
	}

	MutateCollection("songs-ddr.json", (songs: Array<SongDocument<"ddr">>) => [
		...songs,
		...newSongs,
	]);

	// overwrite this collection instead of mutating it
	// we already know the existing chart docs and might have mutated them to
	// declare the new versions, or update chart constants.
	WriteCollection("charts-ddr.json", [...existingChartDocs, ...newCharts]);
}

parseGameData("a3");
