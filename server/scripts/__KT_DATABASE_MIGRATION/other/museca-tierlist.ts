import db from "../../../src/db/db";
import { TierlistDataDocument } from "kamaitachi-common";
import { CalculateTierlistDataID } from "../../../src/core/tierlist-core";
import { oldKTDB } from "../old-db";
import CreateLogCtx from "../../../src/logger";
const logger = CreateLogCtx("museca-tierlist.ts");

const TIERLIST_ID = "ed45403c2cd93922d8a45b3c5bc352a962a8f115";

function ConvertFn(c: any) {
    let tdd: TierlistDataDocument<"Individual Difference"> = {
        chartID: c.chartID,
        type: "score",
        key: null,
        tierlistDataID: CalculateTierlistDataID(c.chartID, "score", null, TIERLIST_ID),
        tierlistID: TIERLIST_ID,
        data: {
            flags: {
                "Individual Difference": c.idvDifference === "FALSE",
            },
            value: c.tiers["score-tier"],
            humanised: `☆${c.tiers["score-tier"]}`,
        },
    };

    return tdd;
}

(async () => {
    let exists = await db["tierlist-data"].count({
        tierlistID: TIERLIST_ID,
    });

    if (exists > 0) {
        logger.error(`Cancelling migration request as ${exists} documents already exist.`);
        return process.exit(1);
    }

    let docs = await oldKTDB.get("tierlistdata").find({
        tierlistID: TIERLIST_ID,
    });

    let newDocs = await Promise.all(docs.map(ConvertFn));

    await db["tierlist-data"].insert(newDocs);
})();
