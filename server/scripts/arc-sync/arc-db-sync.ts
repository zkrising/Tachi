/* eslint-disable no-await-in-loop */
import { Command } from "commander";
import { ServerConfig } from "lib/setup/config";
import db from "external/mongo/db";
import { FindChartWithPTDFVersion, FindSDVXChartOnDFVersion } from "utils/queries/charts";
import { FindSongOnTitle } from "utils/queries/songs";
import CreateLogCtx from "lib/logger/logger";
import fetch from "utils/fetch";
import fs from "fs";
import path from "path";

const logger = CreateLogCtx(__filename);

const program = new Command();

program.option("-u, --url <URL>", "The base URL to sync from.");
program.option("-b, --bearer <token>", "The authorization bearer token to use.");
program.option("-g, --game <game>", "Should be exactly iidx or sdvx.");
program.option("-c, --cache", "Use a local cached JSON file, instead of requesting from the api.");

program.parse(process.argv);
const options = program.opts();

if (!options.game) {
	throw new Error(`Expected -g or --game parameter.`);
}

if (!["iidx", "sdvx"].includes(options.game)) {
	throw new Error(`Expected provided game to be either iidx or sdvx.`);
}

async function GetSongs() {
	const allSongs = [];

	let url =
		options.game === "iidx"
			? `${ServerConfig.ARC_API_URL}/api/v1/iidx/28/music/`
			: `${ServerConfig.ARC_API_URL}/api/v1/sdvx/5/music/`;

	let moreData = true;
	while (moreData) {
		// eslint-disable-next-line no-await-in-loop
		const songs = await fetch(url, {
			headers: {
				Authorization: `Bearer ${options.bearer}`,
			},
		}).then((r) => r.json());

		if (songs._links._next) {
			url = songs._links._next;
		} else {
			moreData = false;
		}

		allSongs.push(...songs._items);
	}

	return allSongs;
}

async function GetCharts() {
	const songs = await GetSongs();

	const allCharts: any[] = [];
	const failed: any[] = [];

	async function DoStuff(song: any) {
		const url =
			options.game === "iidx"
				? `${ServerConfig.ARC_API_URL}/api/v1/iidx/28/charts/?music_id=${song._id}&omnimix=true`
				: `${ServerConfig.ARC_API_URL}/api/v1/sdvx/5/charts/?music_id=${song._id}`;

		try {
			logger.info(`Starting Request ${url}.`);

			// eslint-disable-next-line no-await-in-loop
			const charts = await fetch(url, {
				headers: {
					Authorization: `Bearer ${options.bearer}`,
				},
			}).then((r) => r.json());

			logger.info(`Parsed: ${charts._related.music[0].title}`);

			allCharts.push(charts);
		} catch (err) {
			logger.error(song);
			logger.error(err);
			failed.push(err);
		}
	}

	const promises = songs.map((s: any) => DoStuff(s));

	await Promise.all(promises);

	logger.info(failed);

	logger.info("Retrieved charts.");
	return allCharts;
}

const cacheLoc = path.join(__dirname, "cache.json");

async function MergeIDs() {
	let charts;

	if (options.cache) {
		logger.info(`--cache provided, reading cache.`);
		try {
			charts = JSON.parse(fs.readFileSync(cacheLoc, "utf-8"));
		} catch (err) {
			throw new Error(`No cache, cannot use --cache!`);
		}
	} else {
		logger.info(`Reading from arc.`);

		charts = await GetCharts();
	}

	fs.writeFileSync(cacheLoc, JSON.stringify(charts));

	for (const chartData of charts) {
		const songTitle = chartData._related.music[0].title;

		// eslint-disable-next-line no-await-in-loop
		const song = await FindSongOnTitle(options.game, songTitle);

		if (!song) {
			logger.error(`Could not resolve song ${songTitle}?`);
			continue;
		}

		for (const chart of chartData._items) {
			if (chart.rating === 0) {
				continue;
			}

			const playtype: "SP" | "DP" | "Single" =
				options.game === "iidx" ? (chart.play_style === "DOUBLE" ? "DP" : "SP") : "Single";

			let difficulty = chart.difficulty === "BLACK" ? "LEGGENDARIA" : chart.difficulty;
			const version = options.game === "iidx" ? "28-omni" : "vivid";

			// yeah this fails for wacky playtype mismatches -- i don't care.
			if (
				["ミッドナイト堕天使", "Y&Co. is dead or alive", "State Of The Art"].includes(
					songTitle
				) &&
				difficulty === "LEGGENDARIA"
			) {
				difficulty = "ANOTHER";
			}

			let tachiChart;
			if (options.game === "sdvx") {
				tachiChart = await FindSDVXChartOnDFVersion(
					song.id,
					difficulty === "INF" ? "ANY_INF" : difficulty,
					version as "vivid"
				);
			} else {
				tachiChart = await FindChartWithPTDFVersion(
					options.game,
					song.id,
					playtype,
					difficulty,
					version
				);
			}

			if (!tachiChart) {
				logger.error(
					`Could not find chart ${songTitle} ${playtype} ${difficulty} ${version}.`
				);
				continue;
			}

			// eslint-disable-next-line no-await-in-loop
			await db.charts[options.game as "sdvx" | "iidx"].update(
				{
					chartID: tachiChart.chartID,
				},
				{
					$set: {
						"data.arcChartID": chart._id,
					},
				}
			);
		}
	}

	await db.charts[options.game as "sdvx" | "iidx"].update(
		{
			"data.arcChartID": { $exists: false },
		},
		{ $set: { "data.arcChartID": null } },
		{
			multi: true,
		}
	);

	logger.info("done.");

	process.exit(0);
}

if (require.main === module) {
	MergeIDs();
}
