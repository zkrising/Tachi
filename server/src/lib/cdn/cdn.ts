import fs from "fs";
import path from "path";
import { KTCDN_ROOT } from "../env/env";
import CreateLogCtx from "../logger/logger";
import { promisify } from "util";

const readFilePromise = promisify(fs.readFile);
const writeFilePromise = promisify(fs.writeFile);

const logger = CreateLogCtx(__filename);

/**
 * Joins a file location against the location of the CDN static store.
 */
function CDNRoot(fileLoc: string) {
    return path.join(KTCDN_ROOT, fileLoc);
}

/**
 * Retrieves the data of the file at the given CDN location.
 */
export function Retrieve(fileLoc: string) {
    logger.debug(`Retrieving path ${fileLoc}.`);

    return readFilePromise(CDNRoot(fileLoc));
}

/**
 * Flag for fs.open to write a file but NOT overwrite it if it already exists.
 */
const WRITE_NO_OVERWRITE = "wx";

/**
 * Stores the provided buffer or string as a file at the given location.
 */
export function Store(fileLoc: string, data: Buffer | string) {
    logger.debug(`Storing path ${fileLoc}.`);

    return writeFilePromise(CDNRoot(fileLoc), data, { flag: WRITE_NO_OVERWRITE });
}
