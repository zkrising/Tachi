import monk from "monk";
import fs from "fs";
import path from "path";
import { Command } from "commander";
import CreateLogCtx from "../logger";

const program = new Command();

const logger = CreateLogCtx("save-testdata-from-ktblack.ts");

program.option("-c, --collection <collection>", "The collection to fetch ktblack data from.");

program.parse(process.argv);
const options = program.opts();
const collection = options.collection;

logger.info(`Connecting to ${process.env.MONGO_BASE_URL}/ktblackdb...`);
const ktBlackDB = monk(`${process.env.MONGO_BASE_URL}/ktblackdb`);

(async () => {
    logger.info(`Fetching data for ${collection}...`);
    let data = await ktBlackDB.get(collection).find({}, { projection: { _id: 0 } });

    logger.info(`Fetched ${data.length} documents, Writing...`);

    fs.writeFileSync(
        path.join(__dirname, `../test-utils/test-data/kamaitachi/ktblack-${collection}.json`),
        JSON.stringify(data)
    );

    logger.info("Done!");
    process.exit(0);
})();
