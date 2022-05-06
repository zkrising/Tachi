/**
 * Resets the state of the database.
 */
import db from "external/mongo/db";
import { SetIndexes } from "external/mongo/indexes";
import CreateLogCtx from "lib/logger/logger";
import { Environment, ServerConfig } from "lib/setup/config";
import rimraf from "rimraf";
import fs from "fs";
import path from "path";

// im installing an entire library for rm rf...

if (ServerConfig.CDN_CONFIG.SAVE_LOCATION.TYPE !== "LOCAL_FILESYSTEM") {
	throw new Error(
		`Cannot run tests when CDN_CONFIG.SAVE_LOCATION.TYPE is not LOCAL_FILESYSTEM! (Got ${ServerConfig.CDN_CONFIG.SAVE_LOCATION.TYPE}.)`
	);
}

const logger = CreateLogCtx(__filename);

const DATA_DIR = path.join(__dirname, "./mock-db");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CACHE: Record<string, Array<any>> = {};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ResetState(data: Array<any>, collection: any) {
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

	if (!collection) {
		throw new Error(
			`Panicked when trying to get collection for ${filename}. Does this collection exist?`
		);
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

let CACHE_FILENAMES: Array<string>;

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
	return new Promise<void>((resolve, reject) => {
		if (ServerConfig.CDN_CONFIG.SAVE_LOCATION.TYPE !== "LOCAL_FILESYSTEM") {
			throw new Error(
				`Cannot run tests when CDN_CONFIG.SAVE_LOCATION.TYPE is not LOCAL_FILESYSTEM! (Got ${ServerConfig.CDN_CONFIG.SAVE_LOCATION.TYPE}.)`
			);
		}

		rimraf(ServerConfig.CDN_CONFIG.SAVE_LOCATION.LOCATION, (err) => {
			if (err) {
				reject(err);
			}

			resolve();
		});
	});
}

export async function SetIndexesForDB() {
	await ResetDBState();
	const url = `${Environment.mongoUrl}/testingdb`;

	logger.info(`Setting indexes for ${url}`);

	await SetIndexes(url, true);

	logger.info(`Done.`);
	return true;
}
