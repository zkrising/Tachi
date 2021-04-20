import { ICollection } from "monk";
import CreateLogCtx from "../../logger";
import { oldKTDB } from "./old-db";

const logger = CreateLogCtx("MIGRATE-users.ts");

let newDocuments: unknown[] = [];

export default async function MigrateRecords(
    existingCollection: ICollection,
    collectionName: string,
    HandlerFN: (c: unknown) => unknown
) {
    let existingRecords = await existingCollection.count({});

    if (existingRecords > 0) {
        logger.error(`${existingRecords} documents already exist in db, terminating.`);
        process.exit(1);
    }

    await oldKTDB
        .get(collectionName)
        .find({})
        // @ts-expect-error it exists.
        .each((c) => {
            const newDoc = HandlerFN(c);

            newDocuments.push(newDoc);
        });

    logger.info(`Inserting ${newDocuments.length} documents.`);
    await existingCollection.insert(newDocuments);
    logger.info(`Done!`);

    process.exit(0);
}
