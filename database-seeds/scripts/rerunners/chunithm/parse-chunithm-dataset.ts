import fetch from "node-fetch";
import { CreateChartID, ReadCollection, WriteCollection } from "../../util";
import { ChartDocument, SongDocument } from "tachi-common";

const CURRENT_VERSION = "sun";
const DATA_URL = "https://chunithm.sega.jp/storage/json/music.json";
const ALIAS_URL =
	"https://raw.githubusercontent.com/lomotos10/GCM-bot/main/data/aliases/en/chuni.tsv";

// Obtain a token from https://developer.chunirec.net/ -> ログイン -> アカウント管理 -> big purple button to issue an API key
const CHUNIREC_TOKEN = process.env.CHUNIREC_TOKEN;

const DIFFICULTY_MAP: Record<string, ChartDocument<"chunithm:Single">["difficulty"]> = {
	bas: "BASIC",
	adv: "ADVANCED",
	exp: "EXPERT",
	mas: "MASTER",
	ult: "ULTIMA",
};

const CHUNITHM_CATCODE_MAP = new Map([
	["POPS & ANIME", "0"],
	["POPS&ANIME", "0"],
	["niconico", "2"],
	["東方Project", "3"],
	["ORIGINAL", "5"],
	["VARIETY", "6"],
	["イロドリミドリ", "7"],
	["ゲキマイ", "9"],
]);

const RELEASE_DATES = {
	chuni: new Date("2015-07-16"),
	chuniplus: new Date("2016-02-04"),
	air: new Date("2016-08-25"),
	airplus: new Date("2017-02-09"),
	star: new Date("2017-08-24"),
	starplus: new Date("2018-03-08"),
	amazon: new Date("2018-10-25"),
	amazonplus: new Date("2019-04-11"),
	crystal: new Date("2019-10-24"),
	crystalplus: new Date("2020-07-16"),
	paradise: new Date("2021-01-21"),
	paradiselost: new Date("2021-05-13"),
	new: new Date("2021-11-04"),
	newplus: new Date("2022-04-14"),
	sun: new Date("2022-10-13"),
};

interface ChunithmSong {
	id: string;
	catname: string;
	title: string;
	artist: string;
	lev_bas: string;
	lev_adv: string;
	lev_exp: string;
	lev_mas: string;
	lev_ult: string;
	we_kanji: string;
	we_star: string;
}

interface ChunirecSong {
	meta: {
		id: string;
		title: string;
		genre: string;
		artist: string;
		release: string;
		bpm: number;
	};
	data: Record<
		"BAS" | "ADV" | "EXP" | "MAS" | "ULT" | "WE",
		{
			level: number;
			const: number;
			maxcombo: number;
			is_const_unknown: number;
		}
	>;
}

function normalizeTitle(title: string): string {
	return (
		title
			.toLowerCase()
			.replace(/ /gu, " ")
			// eslint-disable-next-line no-irregular-whitespace
			.replace(/　/gu, " ")
			// eslint-disable-next-line no-irregular-whitespace
			.replace(/ /gu, " ")
			.replace(/：/gu, ":")
			.replace(/（/gu, "(")
			.replace(/）/gu, ")")
			.replace(/！/gu, "!")
			.replace(/？/gu, "?")
			.replace(/`/gu, "'")
			.replace(/’/gu, "'")
			.replace(/”/gu, '"')
			.replace(/～/gu, "~")
	);
}

function releaseDateToVersion(date: Date): string {
	const entries = Object.entries(RELEASE_DATES);

	for (let i = 0; i < entries.length - 1; i++) {
		// @ts-expect-error make ts-node shut up, array access is already in bounds
		if (entries[i][1] <= date && date < entries[i + 1][1]) {
			// @ts-expect-error same as above
			return entries[i][0];
		}
	}
	// @ts-expect-error same as above again
	return entries[entries.length - 1][0];
}

(async () => {
	const chunithmSongs: ChunithmSong[] = await fetch(DATA_URL, {}).then((r) => r.json());
	const chunirecSongs: ChunirecSong[] = await fetch(
		`https://api.chunirec.net/2.0/music/showall.json?token=${CHUNIREC_TOKEN}&region=jp2`,
		{}
	).then((r) => r.json());

	const aliases = new Map();
	const aliasesRaw = await fetch(ALIAS_URL, {}).then((r) => r.text());
	for (const line of aliasesRaw.split("\n")) {
		const [title, ...alias] = line.split("\t");
		aliases.set(title, alias);
	}

	const songs: SongDocument<"chunithm">[] = ReadCollection("songs-chunithm.json");
	const charts: ChartDocument<"chunithm:Single">[] = ReadCollection("charts-chunithm.json");

	for (const chunithmSong of chunithmSongs) {
		// Ignore WORLD'S END entries
		if (chunithmSong.we_kanji || chunithmSong.we_star) {
			continue;
		}

		const chunirecSong = chunirecSongs.find(
			(s) =>
				normalizeTitle(s.meta.title) === normalizeTitle(chunithmSong.title) &&
				CHUNITHM_CATCODE_MAP.get(s.meta.genre) ===
					CHUNITHM_CATCODE_MAP.get(chunithmSong.catname)
		);
		if (!chunirecSong) {
			console.log(`could not find chunirec data for song ${chunithmSong.title}`);
			continue;
		}

		const id = Number(chunithmSong.id);
		const song = songs.find((s) => s.id === id);
		if (!song) {
			songs.push({
				altTitles: [],
				artist: chunithmSong.artist,
				data: {
					displayVersion: releaseDateToVersion(new Date(chunirecSong.meta.release)),
					genre: chunithmSong.catname,
				},
				id: Number(chunithmSong.id),
				searchTerms: aliases.get(chunithmSong.title) ?? [],
				title: chunithmSong.title,
			});
		} else {
			song.searchTerms = aliases.get(chunithmSong.title) ?? [];
		}

		for (const [shortName, fullName] of Object.entries(DIFFICULTY_MAP)) {
			const key = `lev_${shortName}`;
			if (!chunithmSong[key]) {
				continue;
			}

			const chart = charts.find((c) => c.songID === id && c.difficulty === fullName);
			const chunirecChart = chunirecSong.data[shortName.toUpperCase()];

			let chartConstant = chunirecChart.level;
			if (chunirecChart.is_const_unknown === 0) {
				chartConstant = chunirecChart.const;
			}

			if (!chart) {
				charts.push({
					chartID: CreateChartID(),
					data: {
						inGameID: id,
					},
					difficulty: fullName,
					isPrimary: true,
					level: chunithmSong[key],
					levelNum: chartConstant,
					playtype: "Single",
					songID: id,
					versions: [CURRENT_VERSION],
				});
			} else {
				chart.level = chunithmSong[key];
				chart.levelNum = chartConstant;
				if (!chart.versions.includes(CURRENT_VERSION)) {
					chart.versions.push(CURRENT_VERSION);
				}
			}
		}
	}

	WriteCollection("songs-chunithm.json", songs);
	WriteCollection("charts-chunithm.json", charts);
})();
