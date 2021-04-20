import Prudence, { PrudenceSchema } from "prudence";
import db from "../db/db";
import { STATIC_SCHEMAS } from "../db/schemas";
import CreateLogCtx from "../logger";
import fs from "fs";
import path from "path";
import { PrudenceError } from "prudence/js/error";

const BASE_DIR = path.join(__dirname, "./validate-database-errs");

const logger = CreateLogCtx("validate-database.ts");

async function ValidateStaticSchemas(): Promise<void> {
    for (const x in STATIC_SCHEMAS) {
        const c = x as keyof typeof db;
        const schema = STATIC_SCHEMAS[c] as PrudenceSchema;

        logger.info(`=== Validating Collection ${c}... ===`);

        let successCount = 0;
        let total = 0;
        let fails: { err: PrudenceError; doc: unknown }[] = [];

        let start = process.hrtime.bigint();

        // @ts-expect-error shut UP
        // eslint-disable-next-line no-await-in-loop
        await db[c].find({}, { projection: { _id: 0 } }).each((c: unknown) => {
            total++;
            let res = Prudence(c, schema);

            if (res === null) {
                successCount++;
            } else {
                logger.error(res);
                fails.push({ err: res, doc: c });
            }
        });

        let end = process.hrtime.bigint();
        logger.info(`Validated ${total} objects. Took ${Number(end - start) / 1e9} seconds.`);
        logger.info(`Success: ${successCount} (${((successCount * 100) / total).toFixed(2)}%)`);
        logger.info(`Fail: ${fails.length} (${((fails.length * 100) / total).toFixed(2)}%)`);

        if (fails.length !== 0) {
            logger.severe(`Invalid documents found! Please resolve them.`);
            fs.writeFileSync(path.join(BASE_DIR, `${c}.json`), JSON.stringify(fails));
        }
    }

    logger.info("Done!");
    process.exit(0);
}

ValidateStaticSchemas();
