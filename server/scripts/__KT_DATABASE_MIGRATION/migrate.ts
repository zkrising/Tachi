import { ICollection } from "monk";
import CreateLogCtx from "../../src/common/logger";
import { oldKTDB } from "./old-db";

const logger = CreateLogCtx(__filename);

const newDocuments: unknown[] = [];

export default async function MigrateRecords(
    existingCollection: ICollection,
    collectionName: string,
    HandlerFN: (c: unknown) => unknown
) {
    const existingRecords = await existingCollection.count({});
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
        .each(async (c, { pause, resume }) => {
            i++;
            pause();

            if (i % 10000 === 0) {
                logger.info(`Processed ${i} documents.`);
            }
            const newDoc = await HandlerFN(c);

            if (newDoc !== null) {
                newDocuments.push(newDoc);
            }

            resume();
        });

    logger.info(`Inserting ${newDocuments.length} documents.`);
    await existingCollection.insert(newDocuments.flat());
    logger.info(`Done!`);

    process.exit(0);
}
