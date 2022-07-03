/* eslint-disable no-await-in-loop */
import logger from "./logger";
import TableValueGetters from "./lookups";
import { XMLParser } from "fast-xml-parser";
import fetch from "node-fetch";
import { writeFile, readFile } from "fs/promises";
import type { BMSTableChart, BMSTablesDataset } from "./types";

const parser = new XMLParser();

export async function FetchScoresForMD5(md5: string) {
	try {
		const data = JSON.parse(await readFile(`${__dirname}/cache/${md5}.json`, "utf-8"));

		if (!Array.isArray(data)) {
			throw new Error(`Invalid cache for ${md5}`);
		}

		logger.verbose(`Returned ${md5} info from cache.`);
		return data;
	} catch {
		const scores = await fetch(
			`http://dream-pro.info/~lavalse/LR2IR/2/getrankingxml.cgi?songmd5=${md5}&id=1`
		).then((r) => r.text());

		const data = parser.parse(scores).ranking.score;

		if (!Array.isArray(data)) {
			logger.error(`Got rate limited for ${md5}!`, { data });
			throw new Error(`Got rate limited on ${md5}.`);
		}

		await writeFile(`${__dirname}/cache/${md5}.json`, JSON.stringify(data, null, "\t"));

		return data;
	}
}

/**
 * Gets scores from the LR2IR. This will retry, as the LR2IR frequently goes down or
 * responds to genuine requests with empty XML, or throttles you, or blah blah blah.
 *
 * @param md5 - The MD5 to fetch the scores of.
 *
 * @returns An array of scores.
 */
export async function GetScoresForMD5(md5: string) {
	let tries = 0;

	while (tries < 3) {
		try {
			const data = await FetchScoresForMD5(md5);

			return data;
		} catch (err) {
			tries++;
			const sleepTime = (1000 * tries + (Math.random() - 0.5) * 1000) * 2;

			logger.warn(`Got throttled (${md5}): Sleeping for ${sleepTime.toFixed(0)}ms. ${err}`);

			await Sleep(sleepTime);
		}
	}

	throw new Error(`Couldn't fetch data in 3 tries. Giving up and killing self.`);
}

export function Mean(d: Array<number>) {
	return d.reduce((a, r) => a + r, 0) / d.length;
}

export function GetSigmoidalValue(x: number) {
	if (x > 1) {
		return 1;
	}

	// https://math.stackexchange.com/a/2063195
	return 0.5 * (1 + Math.sin(x * Math.PI - Math.PI / 2));
}

export function GetBaseline(table: BMSTablesDataset, level: string) {
	// @ts-expect-error don't care it's exhaustive
	return TableValueGetters[table.name](level);
}

export function GetFString(table: BMSTablesDataset, chart: BMSTableChart) {
	return table.prefix + chart.level;
}

export function Sleep(ms: number) {
	return new Promise<void>((resolve) =>
		setTimeout(() => {
			resolve();
		}, ms)
	);
}

/**
 * Takes an array of functions that resolve to promises, and iterates over them in chunks
 * of `chunkSize`. Calling them and resolving them.
 *
 * This is like Promise.all, but parallelised at a rate of your choice.
 *
 * @param promiseFns - Functions that return a promise.
 * @param chunkSize - How many functions should be called at once.
 *
 * @returns Same as calling Promise.all on your promises.
 */
export async function ChunkifyPromiseAll<D>(
	promiseFns: Array<() => Promise<D>>,
	chunkSize: number
) {
	const slices = [];

	for (let i = 0; i < promiseFns.length; i = i + chunkSize) {
		const slice = promiseFns.slice(i, i + chunkSize);

		slices.push(slice);
	}

	const results = [];

	for (const [n, slice] of Object.entries(slices)) {
		logger.info(`>>>>> RUNNING SLICE ${n}`);
		const d = await Promise.all(slice.map((fn) => fn()));

		logger.info(`>>>>> FINISHED SLICE ${n}`, { len: d.length });

		results.push(...d);
	}

	return results;
}
