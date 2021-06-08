import monk from "monk";
import fs from "fs";
import path from "path";
import { Command } from "commander";
import CreateLogCtx from "../src/common/logger";

const program = new Command();

const logger = CreateLogCtx(__filename);

program.option("-c, --collection <collection>", "The collection to fetch ktblack data from.");

program.parse(process.argv);
const options = program.opts();
const collection = options.collection;

logger.info(`Connecting to ${process.env.MONGO_BASE_URL}/ktblackdb...`);
const ktBlackDB = monk(`${process.env.MONGO_BASE_URL}/ktblackdb`);

(async () => {
    logger.info(`Fetching data for ${collection}...`);
    const data = await ktBlackDB.get(collection).find({}, { projection: { _id: 0 } });

    logger.info(`Fetched ${data.length} documents, Writing...`);

    fs.writeFileSync(
        path.join(__dirname, `../src/test-utils/test-data/tachi/ktblack-${collection}.json`),
        JSON.stringify(data)
    );

    logger.info("Done!");
    process.exit(0);
})();
