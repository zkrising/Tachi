/**
 * Resets the state of the database.
 */
import db from "../db";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(__dirname, "./mock-db");

async function ResetState(file: string) {
    let filename = path.basename(file, ".json");

    await db.get(filename).remove({});

    let fileLoc = path.join(DATA_DIR, file);
    let data = JSON.parse(fs.readFileSync(fileLoc, "utf-8"));

    if (!Array.isArray(data)) {
        throw new Error(`Panic, ${filename} not JSONArray?`);
    }

    await db.get(filename).insert(data);
}

export default async function ResetDBState() {
    const files = fs.readdirSync(DATA_DIR);

    const promises = [];

    for (const file of files) {
        promises.push(ResetState(file));
    }

    await Promise.all(promises);
}
