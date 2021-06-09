import fs from "fs";
import path from "path";
import db from "../../../src/external/mongo/db";

const songs = JSON.parse(fs.readFileSync(path.join(__dirname, "songs.json"), "utf-8"));
const charts = JSON.parse(fs.readFileSync(path.join(__dirname, "deduped-charts.json"), "utf-8"));

(async () => {
    await db.songs.usc.remove({});
    await db.charts.usc.remove({});
    await db.songs.usc.insert(songs);
    await db.charts.usc.insert(charts);
})();
