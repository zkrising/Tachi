/* eslint-disable no-await-in-loop */

import { ReadCollection, WriteCollection } from "../../util";
import { ChartDocument, SongDocument } from "tachi-common";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

type SDVXChart = ChartDocument<"sdvx:Single">;
type SDVXSong = SongDocument<"sdvx">;

// Tier 0+ and Tier 0- for the Lvl 19/20 tierlist are internally named -1 and 0
// respectively, so map them back to the display names
const MANUAL_TIERS: { [level: number]: { [tier: string]: string } } = {
	19: {
		"-1": "0+",
		0: "0-",
	},
};

async function scrape(charts: SDVXChart[], songs: SDVXSong[], level: number) {
	const html = await (await fetch(`https://sdvx.maya2silence.com/table/${level}`, {})).text();
	const $ = cheerio.load(html);

	for (const tierContainer of $(".tier_container")) {
		const tier = tierContainer.attribs["data-tier"];

		// Songs under this tier are not yet rated
		if (!tier || tier === "999") {
			continue;
		}

		const tierText = `Tier ${MANUAL_TIERS[level]?.[tier] ?? tier}`;

		for (const songInfo of $(tierContainer).find(".song_info")) {
			const title = songInfo.attribs["data-title"] || "";
			const artist = songInfo.attribs["data-artist"];
			const song = songs.find(
				(s) => s.artist === artist && (s.title === title || s.altTitles.includes(title))
			);

			if (!song) {
				console.error(`[Unknown Song] ${title} - ${artist}`);

				continue;
			}

			const diff = songInfo.attribs["data-diff_type"];
			const chart = charts.find((c) => c.songID === song.id && c.difficulty === diff);

			if (!chart) {
				console.error(`[Unknown Chart] ${title} - ${artist} [${diff}]`);

				continue;
			}

			// e.g. Level 17 Tier 9 -> 17 + 1 - 9 / 10 = 17.1
			const value = level + 1 - parseInt(tier, 10) / 10;

			if (chart.data.sTier) {
				if (chart.data.sTier.text !== tierText) {
					console.log(
						`[${chart.data.sTier.text} -> ${tierText}]: ${title} - ${artist} [${diff}]`
					);

					chart.data.sTier.text = tierText;
					chart.data.sTier.value = value;
				}
			} else {
				console.log(`[${tierText}] ${title} - ${artist} [${diff}]`);

				chart.data.sTier = {
					individualDifference: false,
					text: tierText,
					value,
				};
			}
		}
	}
}

async function main() {
	const charts: SDVXChart[] = ReadCollection("charts-sdvx.json");
	const songs: SDVXSong[] = ReadCollection("songs-sdvx.json");

	for (const level of [17, 18, 19]) {
		console.log(`\nScraping Level ${level}`);

		await scrape(charts, songs, level);
	}

	WriteCollection("charts-sdvx.json", charts);
}

main();
