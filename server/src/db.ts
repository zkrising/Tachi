import monk from "monk";
import createLogCtx from "./logger";

const logger = createLogCtx("db.ts");

const url =
    process.env.NODE_ENV === "test" ? "localhost:27017/testingdb" : "localhost:27017/ktblackdb";

let dbtime: [number, number] = [0, 0];
if (process.env.NODE_ENV !== "test") {
    logger.info(`Connecting to database ${url}...`);
    dbtime = process.hrtime();
}

let db = monk(url);

if (process.env.NODE_ENV !== "test") {
    db.then(() => {
        let time = process.hrtime(dbtime);
        let elapsed = time[0] + time[1] / 1000000;
        logger.info(`Database connection successful: took ${elapsed}ms`);
    });
}

export async function ReOpenConnection() {
    db = monk(url);
    await db.then();
}

export async function CloseConnection() {
    await db.close();
}

export default db;
