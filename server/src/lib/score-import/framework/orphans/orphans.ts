import db from "../../../../external/mongo/db";
import {
    ImportTypeContextMap,
    ImportTypeDataMap,
    OrphanScoreDocument,
} from "../../import-types/common/types";
import { ImportTypes, integer } from "kamaitachi-common";
import fjsh from "fast-json-stable-hash";
import { KtLogger } from "../../../logger/logger";

/**
 * Creates an OrphanedScore document from the data and context,
 * and inserts it into the DB if it is not already in there.
 *
 * @returns True if the score was inserted, False if it wasn't.
 */
export async function OrphanScore<T extends ImportTypes = ImportTypes>(
    importType: T,
    userID: integer,
    data: ImportTypeDataMap[T],
    context: ImportTypeContextMap[T],
    errMsg: string | null,
    logger: KtLogger
) {
    const orphan: Pick<
        OrphanScoreDocument,
        "importType" | "data" | "converterContext" | "userID"
    > = {
        importType,
        data,
        converterContext: context,
        userID,
    };

    const orphanID = `O${fjsh.hash(orphan, "sha256")}`;

    const exists = await db["orphan-scores"].findOne({ orphanID });

    if (exists) {
        logger.debug(`Skipped orphaning score ${orphanID} because it already exists.`);
        return false;
    }

    const orphanScoreDoc: OrphanScoreDocument = {
        ...orphan,
        orphanID,
        errMsg,
        timeInserted: Date.now(),
    };

    await db["orphan-scores"].insert(orphanScoreDoc);

    return true;
}

/**
 * Attempts to de-orphan scores by re-running a import with their data.
 * @param userID - The userID to attempt to de-orphan scores from.
 */
export async function ReprocessOrphans(userID: integer) {
    
};
