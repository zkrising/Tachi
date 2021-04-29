import { integer, PBScoreDocument } from "kamaitachi-common";
import db from "../../../../db/db";
import { KtLogger } from "../../../../types";
import { CreatePBDoc } from "./create-pb-doc";

export async function ProcessPBs(userID: integer, chartIDs: Set<string>, logger: KtLogger) {
    let promises = [];

    for (const chartID of chartIDs) {
        promises.push(CreatePBDoc(userID, chartID, logger));
    }

    let pbDocs = (await Promise.all(promises)).filter((e) => !!e) as PBScoreDocument[];

    let r = await db["score-pbs"].bulkWrite(
        pbDocs.map((e) => ({
            updateOne: {
                filter: { chartID: e.chartID, userID: e.userID },
                update: { $set: e },
                upsert: true,
            },
        }))
    );

    // @ts-expect-error monk machine broken
    return r.nUpserted;
}
