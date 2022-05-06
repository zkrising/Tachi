import { DeleteFromS3, PushToS3 } from "./s3";
import CreateLogCtx from "lib/logger/logger";
import { ServerConfig } from "lib/setup/config";
import mkdirp from "mkdirp";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import type { Response } from "express";

const readFilePromise = promisify(fs.readFile);
const writeFilePromise = promisify(fs.writeFile);
const rmFilePromise = promisify(fs.rm);

const logger = CreateLogCtx(__filename);

/**
 * Joins a file location against the location of the CDN static store.
 *
 * @danger - This function should **NEVER** be called with unsanitised user input!
 * Path directory traversal *is* possible, and *will* ruin your day.
 */
export function CDNFileSystemRoot(fileLoc: string) {
	if (ServerConfig.CDN_CONFIG.SAVE_LOCATION.TYPE !== "LOCAL_FILESYSTEM") {
		logger.severe(
			`Attempted to run CDNFileSystemRoot, but was not using LOCAL_FILESYSTEM as a CDN.`,
			{ fileLoc, conf: ServerConfig.CDN_CONFIG }
		);

		throw new Error(
			`Attempted to run CDNFileSystemRoot, but was not using LOCAL_FILESYSTEM as a CDN.`
		);
	}

	return path.join(ServerConfig.CDN_CONFIG.SAVE_LOCATION.LOCATION, fileLoc);
}

/**
 * Retrieves the data of the file at the given CDN location.
 *
 * This is used for quick development setups, where a cdn server isn't available.
 * As in, this ruins the purpose of a CDN! make sure you have one running.
 */
export function CDNRetrieve(fileLoc: string) {
	logger.debug(`Retrieving path ${fileLoc} locally.`);

	return readFilePromise(CDNFileSystemRoot(fileLoc));
}

/**
 * Redirects the response to the CDN server at the given path.
 */
export function CDNRedirect(res: Response, fileLoc: string) {
	if (!fileLoc.startsWith("/")) {
		throw new Error(`Invalid fileLoc - did not start with /.`);
	}

	logger.debug(`CDN Redirecting to ${ServerConfig.CDN_CONFIG.WEB_LOCATION}${fileLoc}.`);

	res.redirect(`${ServerConfig.CDN_CONFIG.WEB_LOCATION}${fileLoc}`);
}

/**
 * Stores a file at fileLoc. If it already exists, overwrite it.
 */
export async function CDNStoreOrOverwrite(fileLoc: string, data: Buffer | string): Promise<void> {
	logger.debug(`Storing or overwriting path ${fileLoc}.`);

	if (ServerConfig.CDN_CONFIG.SAVE_LOCATION.TYPE === "LOCAL_FILESYSTEM") {
		const loc = CDNFileSystemRoot(fileLoc);

		// make the parent folders if they dont exist. else, mkdirp is a no-op.
		await mkdirp(path.dirname(loc));

		return writeFilePromise(loc, data);
	}

	await PushToS3(fileLoc, data);
}

/**
 * Removes a file at this CDN location.
 */
export async function CDNDelete(fileLoc: string) {
	logger.verbose(`Deleting path ${fileLoc}.`);

	if (ServerConfig.CDN_CONFIG.SAVE_LOCATION.TYPE === "LOCAL_FILESYSTEM") {
		const loc = CDNFileSystemRoot(fileLoc);

		return rmFilePromise(loc, { force: true });
	}

	await DeleteFromS3(fileLoc);
}
