import monk from "monk";
import createLogCtx from "./logger";

const logger = createLogCtx("db.ts");

const url = "localhost:27017/kamaitachidb";
logger.info(`Connecting to database ${url}...`);

let dbtime = process.hrtime();
const db = monk(url);

db.then(() => {
    let time = process.hrtime(dbtime);
    let elapsed = time[0] + time[1] / 1000000;
    logger.info(`Database connection successful: took ${elapsed}ms`);
});

export default db;
