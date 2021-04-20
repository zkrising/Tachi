import p from "prudence";
import db, { monkDB } from "../db/db";
import { SCHEMAS } from "../db/schemas";
import CreateLogCtx from "../logger";
import fs from "fs";
import path from "path";
import { PrudenceError } from "prudence/js/error";

const BASE_DIR = path.join(__dirname, "./validate-database-errs");

const logger = CreateLogCtx("validate-database.ts");

async function ValidateStaticSchemas(): Promise<void> {
    for (const c in SCHEMAS) {
        // @ts-expect-error shut up
        const schema = SCHEMAS[c];

        logger.info(`=== Validating Collection ${c}... ===`);

        let successCount = 0;
        let total = 0;
        let fails: { err: PrudenceError; doc: unknown }[] = [];

        // eslint-disable-next-line no-await-in-loop
        await monkDB
            .get(c)
            .find({}, { projection: { _id: 0 } })
            // @ts-expect-error monk's types are just so broken, wtf?
            .each((c: unknown) => {
                total++;
                let res = p(c, schema);

                if (res === null) {
                    successCount++;
                } else {
                    logger.error(res);
                    fails.push({ err: res, doc: c });
                }
            });

        logger.info(`Validated ${total} objects.`);
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
