import fs from "fs";
import path from "path";
import CreateLogCtx from "lib/logger/logger";
import { promisify } from "util";
import mkdirp from "mkdirp";
import { Response } from "express";
import { Environment, ServerConfig } from "lib/setup/config";

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
function CDNRoot(fileLoc: string) {
	return path.join(Environment.cdnRoot, fileLoc);
}

/**
 * Retrieves the data of the file at the given CDN location.
 *
 * This is used for quick development setups, where a cdn server isn't available.
 * As in, this ruins the purpose of a CDN! make sure you have one running.
 */
export function CDNRetrieve(fileLoc: string) {
	logger.debug(`Retrieving path ${fileLoc} locally.`);

	return readFilePromise(CDNRoot(fileLoc));
}

/**
 * Redirects the response to the CDN server at the given path.
 */
export function CDNRedirect(res: Response, fileLoc: string) {
	if (fileLoc[0] !== "/") {
		throw new Error(`Invalid fileLoc - did not start with /.`);
	}

	return res.redirect(`/cdn${fileLoc}`);
}

/**
 * Flag for fs.open to write a file but NOT overwrite it if it already exists.
 */
const WRITE_NO_OVERWRITE = "wx";

/**
 * Stores the provided buffer or string as a file at the given location.
 * @returns Nothing on success. Throws on error.
 */
export async function CDNStore(fileLoc: string, data: Buffer | string) {
	logger.debug(`Storing path ${fileLoc}.`);

	const loc = CDNRoot(fileLoc);

	// make the parent folders if they dont exist. else, mkdirp is a no-op.
	await mkdirp(path.dirname(loc));

	return writeFilePromise(loc, data, { flag: WRITE_NO_OVERWRITE });
}

/**
 * Stores a file at fileLoc. If it already exists, overwrite it.
 */
export async function CDNStoreOrOverwrite(fileLoc: string, data: Buffer | string) {
	logger.debug(`Storing or overwriting path ${fileLoc}.`);

	const loc = CDNRoot(fileLoc);

	// make the parent folders if they dont exist. else, mkdirp is a no-op.
	await mkdirp(path.dirname(loc));

	return writeFilePromise(loc, data);
}

/**
 * Removes a file at this CDN location.
 */
export function CDNDelete(fileLoc: string) {
	logger.verbose(`Deleting path ${fileLoc}.`);

	const loc = CDNRoot(fileLoc);

	return rmFilePromise(loc, { force: true });
}
