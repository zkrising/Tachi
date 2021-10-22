import { Command } from "commander";
import { ServerConfig } from "lib/setup/config";
import db from "external/mongo/db";
import { FindChartWithPTDFVersion } from "utils/queries/charts";
import { FindSongOnTitle } from "utils/queries/songs";
import CreateLogCtx from "lib/logger/logger";
import fetch from "utils/fetch";

const logger = CreateLogCtx(__filename);

const program = new Command();

program.option("-u, --url <URL>", "The base URL to sync from.");
program.option("-b, --bearer <token>", "The authorization bearer token to use.");
program.option("-g, --game <game>", "Should be exactly iidx or sdvx.");

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

async function MergeIDs() {
	const charts = await GetCharts();

	for (const chartData of charts) {
		const songTitle = chartData._related.music[0].title;

		// eslint-disable-next-line no-await-in-loop
		const song = await FindSongOnTitle(options.game, songTitle);

		if (!song) {
			logger.error(`Could not resolve ${songTitle}?`);
			continue;
		}

		for (const chart of chartData._items) {
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

			// eslint-disable-next-line no-await-in-loop
			const tachiChart = await FindChartWithPTDFVersion(
				options.game,
				song.id,
				playtype,
				difficulty,
				version
			);

			if (!tachiChart) {
				logger.error(
					`Could not find chart ${songTitle} ${playtype} ${difficulty} ${version}.`
				);
				continue;
			}

			// eslint-disable-next-line no-await-in-loop
			await db.charts[options.game as "sdvx" | "iidx"].update(
				{
					_id: tachiChart._id,
				},
				{
					$set: {
						"data.arcChartID": chart._id,
					},
				}
			);
		}
	}

	const r = await db.charts[options.game as "sdvx" | "iidx"].update(
		{
			"data.arcChartID": { $exists: false },
		},
		{ $set: { "data.arcChartID": null } },
		{
			multi: true,
		}
	);

	logger.info("done.", { r });
}

if (require.main === module) {
	MergeIDs();
}
