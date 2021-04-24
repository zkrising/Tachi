import { ICollection } from "monk";
import CreateLogCtx from "../../logger";
import { oldKTDB } from "./old-db";

const logger = CreateLogCtx("MIGRATE.ts");

let newDocuments: unknown[] = [];

export default async function MigrateRecords(
    existingCollection: ICollection,
    collectionName: string,
    HandlerFN: (c: unknown) => unknown
) {
    let existingRecords = await existingCollection.count({});
    logger.info(`Starting migration for ${collectionName}...`);

    if (existingRecords > 0) {
        logger.error(`${existingRecords} documents already exist in db, terminating.`);
        process.exit(1);
    }

    let i = 0;

    await oldKTDB
        .get(collectionName)
        .find({})
        // @ts-expect-error it exists.
        .each((c) => {
            i++;

            if (i % 10000 === 0) {
                logger.info(`Processed ${i} documents.`);
            }
            const newDoc = HandlerFN(c);

            if (newDoc !== null) {
                newDocuments.push(newDoc);
            }
        });

    logger.info(`Inserting ${newDocuments.length} documents.`);
    await existingCollection.insert(newDocuments);
    logger.info(`Done!`);

    process.exit(0);
}
