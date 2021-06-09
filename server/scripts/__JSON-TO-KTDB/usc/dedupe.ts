import fs from "fs";
import path from "path";
import db from "../../../src/external/mongo/db";

const charts = JSON.parse(fs.readFileSync(path.join(__dirname, "charts.json"), "utf-8"));

const map: Map<string, any> = new Map();

for (const chart of charts) {
    const id = `${chart.songID}-${chart.difficulty}`;
    const doc = map.get(id);

    if (doc) {
        if (Array.isArray(doc.data.hashSHA1)) {
            doc.data.hashSHA1.push(chart.data.hashSHA1);
        } else {
            doc.data.hashSHA1 = [doc.data.hashSHA1, chart.data.hashSHA1];
        }

        // insane hack
        chart.erasethis = true;
    } else {
        map.set(id, chart);
    }
}

// works because byref
fs.writeFileSync(
    path.join(__dirname, "deduped-charts.json"),
    JSON.stringify(charts.filter((e: any) => e.erasethis !== true))
);
