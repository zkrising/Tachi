import fs from "fs";
import path from "path";
import { PRUDENCE_CHART_SCHEMAS } from "../../src/db/schemas";
import p from "prudence";
import db from "../../src/db/db";
import CreateLogCtx from "../../src/common/logger";

const logger = CreateLogCtx(__filename);

const data = JSON.parse(fs.readFileSync(path.join(__dirname, "./hcnverdata.json"), "utf-8"));

for (const d of data) {
	const r = p(d, PRUDENCE_CHART_SCHEMAS.iidx);
	if (r) {
		logger.error(r.userVal);
		logger.error(r);
		throw r;
	}
}

db.charts.iidx.insert(data).then(() => {
	logger.info("Done.");
	process.exit(0);
});
