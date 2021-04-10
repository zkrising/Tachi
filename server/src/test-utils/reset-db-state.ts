/**
 * Resets the state of the database.
 */
import db from "../db/db";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(__dirname, "./mock-db");

async function ResetState(file: string) {
    let filename = path.basename(file, ".json");

    // @ts-expect-error it's right, but we know what we're doing!
    await db[filename].remove({});

    let fileLoc = path.join(DATA_DIR, file);
    let data = JSON.parse(fs.readFileSync(fileLoc, "utf-8"));

    if (!Array.isArray(data)) {
        throw new Error(`Panic, ${filename} not JSONArray?`);
    }

    // @ts-expect-error see above.
    await db[filename].insert(data);
}

export default async function ResetDBState() {
    const files = fs.readdirSync(DATA_DIR);

    const promises = [];

    for (const file of files) {
        promises.push(ResetState(file));
    }

    await Promise.all(promises);
}
