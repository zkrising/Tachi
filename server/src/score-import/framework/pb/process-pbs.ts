import { integer, PBScoreDocument } from "kamaitachi-common";
import db from "../../../db/db";
import { KtLogger } from "../../../types";
import { CreatePBDoc } from "./create-pb-doc";

export async function ProcessPBs(
    userID: integer,
    chartIDs: Set<string>,
    logger: KtLogger
): Promise<void> {
    let promises = [];

    for (const chartID of chartIDs) {
        promises.push(CreatePBDoc(userID, chartID, logger));
    }

    let pbDocs = (await Promise.all(promises)).filter((e) => !!e) as PBScoreDocument[];

    if (pbDocs.length === 0) {
        let toStr = "";
        for (const c of chartIDs) {
            toStr += `${c},`;
        }

        logger.warn(
            `Skipping PB processing as pbDocs is an empty array. This was probably caused by a previous severe-level warning.`,
            { userID, chartIDs: toStr }
        );
        return;
    }

    await db["score-pbs"].bulkWrite(
        pbDocs.map((e) => ({
            updateOne: {
                filter: { chartID: e.chartID, userID: e.userID },
                update: { $set: e },
                upsert: true,
            },
        }))
    );

    // originally we returned nUpserted from this function, but it's not
    // very useful to anyone, tbh.
    return;
}
