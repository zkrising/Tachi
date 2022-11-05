import { PullDatabaseSeeds } from "lib/database-seeds/repo";
import CreateLogCtx from "lib/logger/logger";
import { RecalcAllScores } from "utils/calculations/recalc-scores";
import fetch from "utils/fetch";
import type {
	ChartDocument,
	Difficulties,
	GPTSupportedVersions,
	integer,
	Playtypes,
	SongDocument,
} from "tachi-common";

const logger = CreateLogCtx(__filename);

const difficultyResolve: Record<string, [Playtypes["iidx"], Difficulties["iidx:DP" | "iidx:SP"]]> =
	{
		3: ["SP", "HYPER"],
		4: ["SP", "ANOTHER"],
		8: ["DP", "HYPER"],
		9: ["DP", "ANOTHER"],
		10: ["SP", "LEGGENDARIA"],
		11: ["DP", "LEGGENDARIA"],
	};

interface PoyashiProxyBPIInfo {
	title: string;
	difficulty: string;
	wr: integer;
	avg: integer;
	notes: string;
	bpm: string;
	textage: string;
	difficultyLevel: string;
	dpLevel: string;
	coef?: number | string | null;
	removed?: boolean;
}

interface PoyashiProxyData {
	version: integer;
	requireVersion: string;
	body: Array<PoyashiProxyBPIInfo>;
}

/**
 * Fetches Poyashi BPI's latest information and syncs it back to the seeds repository.
 *
 * @note This function doesn't actually touch or backsync our database at all. Infact,
 * the commit that hits the seeds repo will result in a database-sync, meaning this
 * will all "just work"(tm)
 */
export async function UpdatePoyashiData() {
	const repo = await PullDatabaseSeeds();

	logger.info("Fetching data from proxy...");
	const data = (await fetch("https://proxy.poyashi.me/?type=bpi").then((r) =>
		r.json()
	)) as PoyashiProxyData;

	logger.info("Fetched data.");

	const iidxSongs: Array<SongDocument<"iidx">> = await repo.ReadCollection("songs-iidx");
	const iidxCharts: Array<ChartDocument<"iidx:DP" | "iidx:SP">> = await repo.ReadCollection(
		"charts-iidx"
	);

	// Utility functions for finding matching charts.
	function FindSongOnTitle(title: string) {
		for (const data of iidxSongs) {
			if (data.title === title || data.altTitles.includes(title)) {
				return data;
			}
		}

		return null;
	}

	function FindChartWithPTDFVersion(
		songID: integer,
		playtype: Playtypes["iidx"],
		diff: Difficulties["iidx:DP" | "iidx:SP"],
		version: GPTSupportedVersions["iidx:DP" | "iidx:SP"]
	) {
		for (const chart of iidxCharts) {
			if (
				chart.songID === songID &&
				chart.playtype === playtype &&
				chart.difficulty === diff &&
				chart.versions.includes(version)
			) {
				return chart;
			}
		}

		return null;
	}

	const updatedChartIDs = [];

	// The actual mutation.
	for (const d of data.body) {
		const res: ["DP" | "SP", Difficulties["iidx:DP" | "iidx:SP"]] | undefined =
			difficultyResolve[d.difficulty];

		if (!res) {
			throw new Error(`Unknown difficulty ${d.difficulty}`);
		}

		const [playtype, diff] = res;

		const tachiSong = FindSongOnTitle(d.title);

		if (!tachiSong) {
			logger.warn(`Cannot find song ${d.title}?`);
			continue;
		}

		// current poyashi version is 29
		const tachiChart = FindChartWithPTDFVersion(tachiSong.id, playtype, diff, "29");

		if (!tachiChart) {
			logger.warn(
				`Cannot find chart ${tachiSong.title} (${tachiSong.id}) ${playtype}, ${diff}?`
			);
			continue;
		}

		const kavg = Number(d.avg);

		if (kavg < 0) {
			logger.warn(
				`${tachiSong.title} (${playtype} ${diff}). Invalid kavg ${d.avg}, Skipping.`
			);
			continue;
		}

		if (d.removed === true) {
			logger.info(`Skipping removed chart ${tachiSong.title}.`);
			continue;
		}

		// for some godforsaken reason, poyashi likes to store their numbers as strings
		// ... but only sometimes.
		const newCoef = Number(d.coef) === -1 || d.coef === undefined ? null : Number(d.coef);
		const newKavg = Number(d.avg);
		const newWR = Number(d.wr);

		if (
			tachiChart.data.bpiCoefficient !== newCoef ||
			tachiChart.data.kaidenAverage !== newKavg ||
			tachiChart.data.worldRecord !== newWR
		) {
			updatedChartIDs.push(tachiChart.chartID);

			tachiChart.data.bpiCoefficient = newCoef;
			tachiChart.data.kaidenAverage = newKavg;
			tachiChart.data.worldRecord = newWR;
		}
	}

	await repo.WriteCollection("charts-iidx", iidxCharts);

	if (updatedChartIDs.length !== 0) {
		logger.info(`Finished applying BPI changes. Writing back.`);

		await repo.CommitChangesBack(`BPI Update ${new Date().toISOString()}`);

		logger.info(`Recalcing scores.`);
		await RecalcAllScores({
			game: "iidx",
			chartID: { $in: updatedChartIDs },
		});

		logger.info(`Finished recalcing scores.`);
	}

	await repo.Destroy();
}

if (require.main === module) {
	UpdatePoyashiData()
		.then(() => {
			process.exit(0);
		})
		.catch((err: unknown) => {
			logger.error("Failed to update poyashi data.", { err }, () => {
				process.exit(1);
			});
		});
}
