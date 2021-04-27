/* eslint-disable no-console */
import fs from "fs";
import path from "path";
import { PRUDENCE_CHART_SCHEMAS } from "../../db/schemas";
import p from "prudence";
import db from "../../db/db";

let data = JSON.parse(fs.readFileSync(path.join(__dirname, "./hcnverdata.json"), "utf-8"));

for (const d of data) {
    let r = p(d, PRUDENCE_CHART_SCHEMAS.iidx);
    if (r) {
        console.dir(r);
        throw r;
    }
}

db.charts.iidx.insert(data).then((r) => {
    console.log("Done.");
    process.exit(0);
});
