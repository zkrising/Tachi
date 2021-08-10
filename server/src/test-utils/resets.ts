/**
 * Resets the state of the database.
 */
import db from "external/mongo/db";
import fs from "fs";
import path from "path";
import CreateLogCtx from "lib/logger/logger";
// im installing an entire library for rm rf...
import rimraf from "rimraf";
import { SetIndexes } from "external/mongo/indexes";
import { ServerConfig } from "lib/setup/config";

const logger = CreateLogCtx(__filename);

const DATA_DIR = path.join(__dirname, "./mock-db");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CACHE: Record<string, any[]> = {};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ResetState(data: any[], collection: any) {
	await collection.remove({});

	await collection.insert(data);
}

function GetAndCache(filename: string, fileLoc: string) {
	let collection;
	if (filename.startsWith("songs-")) {
		// @ts-expect-error it's right, but we know what we're doing!
		collection = db.songs[filename.split("-")[1]];
	} else if (filename.startsWith("charts-")) {
		// @ts-expect-error see above
		collection = db.charts[filename.split("-")[1]];
	} else {
		// @ts-expect-error see above
		collection = db[filename];
	}

	if (CACHE[filename]) {
		return { data: CACHE[filename], collection };
	}

	const data = JSON.parse(fs.readFileSync(fileLoc, "utf-8"));

	if (!Array.isArray(data)) {
		throw new Error(`Panic, ${filename} not JSONArray?`);
	}

	CACHE[filename] = data;

	return { data, collection };
}

let CACHE_FILENAMES: string[];

export default async function ResetDBState() {
	let files;
	if (CACHE_FILENAMES) {
		files = CACHE_FILENAMES;
	} else {
		files = fs.readdirSync(DATA_DIR);
		CACHE_FILENAMES = files;
	}

	const promises = [];

	for (const file of files) {
		const filename = path.basename(file, ".json");
		const fileLoc = path.join(DATA_DIR, file);

		const { data, collection } = GetAndCache(filename, fileLoc);

		promises.push(ResetState(data, collection));
	}

	await Promise.all(promises);
}

export function ResetCDN() {
	return new Promise<void>((resolve, reject) =>
		rimraf(ServerConfig.CDN_FILE_ROOT, (err) => {
			if (err) {
				reject(err);
			}
			resolve();
		})
	);
}

export async function SetIndexesForDB() {
	const url = `${ServerConfig.MONGO_CONNECTION_URL}/testingdb`;

	logger.info(`Setting indexes for ${url}`);

	await SetIndexes(url, true);

	logger.info(`Done.`);
	return true;
}
