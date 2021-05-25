/**
 * Resets the state of the database.
 */
import db from "../db/db";
import fs from "fs";
import path from "path";
import CreateLogCtx from "../common/logger";

const logger = CreateLogCtx(__filename);

const DATA_DIR = path.join(__dirname, "./mock-db");

async function ResetState(file: string) {
    const filename = path.basename(file, ".json");

    let collection;

    try {
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

        await collection.remove({});

        const fileLoc = path.join(DATA_DIR, file);
        const data = JSON.parse(fs.readFileSync(fileLoc, "utf-8"));

        if (!Array.isArray(data)) {
            throw new Error(`Panic, ${filename} not JSONArray?`);
        }

        await collection.insert(data);
    } catch (err) {
        logger.crit(`Fatal in ResetState: ${filename} ${err}`);
        throw err;
    }
}

export default async function ResetDBState() {
    const files = fs.readdirSync(DATA_DIR);

    const promises = [];

    for (const file of files) {
        promises.push(ResetState(file));
    }

    await Promise.all(promises);
}
