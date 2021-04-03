/**
 * Resets the state of the database.
 */
import db from "../db";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(__dirname, "./mock-db");

export default async function ResetDBState() {
    const files = fs.readdirSync(DATA_DIR);

    for (const file of files) {
        let filename = path.basename(file, ".json");

        await db.get(filename).remove({});

        let fileLoc = path.join(DATA_DIR, file);
        let data = JSON.parse(fs.readFileSync(fileLoc).toString());

        if (!Array.isArray(data)) {
            throw new Error(`Panic, ${filename} not JSONArray?`);
        }

        await db.get(filename).insert(data);
    }
}
