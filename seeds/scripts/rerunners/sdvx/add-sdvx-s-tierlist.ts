import { Command } from "commander";
import { ReadCollection, MutateCollection } from "../../util";
import { ChartDocument, SongDocument } from "tachi-common";
import { readFileSync } from "fs";

type Tierlist = {
	level: number;
	data: TierlistTier[];
};

type TierlistTier = {
	name: string;
	songs: {
		title: string;
		artist: string;
		diff: string;
	}[];
};

// Tier 0+ and Tier 0- for the Lvl 19/20 tierlist are internally named -1 and 0
// respectively, so map them back to the display names
const MANUAL_TIERS = {
	19: {
		"-1": "0+",
		0: "0-",
	},
};

const program = new Command();

program.option("-f, --file <tierlist JSON>");
program.parse(process.argv);

const options = program.opts();
const songSeeds: SongDocument<"sdvx">[] = ReadCollection("songs-sdvx.json");
const tierlists: Tierlist[] = JSON.parse(readFileSync(options.file, "utf-8"));

function normalizeString(s: string) {
	return s.toLowerCase().replace(/ /gu, "").replace(/（/gu, "(").replace(/）/gu, ")");
}

function match(s1: string, s2: string, strictMatch = true) {
	const n1 = normalizeString(s1);
	const n2 = normalizeString(s2);

	return strictMatch ? n1 === n2 : n1.startsWith(n2) || n2.startsWith(n1);
}

function matchSong(artist: string, title: string) {
	let song = songSeeds.find((s) => match(s.artist, artist) && match(s.title, title));

	if (!song) {
		song = songSeeds.find(
			(s) => match(s.artist, artist, false) && match(s.title, title, false)
		);
	}

	return song;
}

for (const tierlist of tierlists) {
	const { data, level } = tierlist;

	MutateCollection("charts-sdvx.json", (charts: ChartDocument<"sdvx:Single">[]) => {
		for (const tier of data) {
			const { name, songs } = tier;

			// Songs under this tier are not yet rated
			if (name === "999") {
				continue;
			}

			for (const entry of songs) {
				const { artist, title, diff } = entry;
				const song = matchSong(artist, title);

				if (!song) {
					console.log(`No song match for: ${artist} - ${title}`);

					continue;
				}

				const chart = charts.find((c) => c.songID === song.id && c.difficulty === diff);

				if (!chart) {
					console.log(`No chart match for: ${artist} - ${title} [${diff} ${level}]`);
					continue;
				}

				chart.data.sTier = {
					individualDifference: false,
					text: `Tier ${MANUAL_TIERS[level]?.[tier.name] ?? tier.name}`,
					// e.g. Level 17 Tier 9 -> 17 + 1 - 9 / 10 = 17.1
					value: level + 1 - parseInt(tier.name, 10) / 10,
				};
			}
		}

		return charts;
	});
}
