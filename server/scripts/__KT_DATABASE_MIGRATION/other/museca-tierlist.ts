import db from "../../../src/db/db";
import { TierlistDataDocument } from "tachi-common";
import { CalculateTierlistDataID } from "../../../src/common/tierlist";
import { oldKTDB } from "../old-db";
import CreateLogCtx from "../../../src/common/logger";
const logger = CreateLogCtx(__filename);

const TIERLIST_ID = "ed45403c2cd93922d8a45b3c5bc352a962a8f115";

function ConvertFn(c: any) {
    const tdd: TierlistDataDocument<"Individual Difference"> = {
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
    const exists = await db["tierlist-data"].count({
        tierlistID: TIERLIST_ID,
    });

    if (exists > 0) {
        logger.error(`Cancelling migration request as ${exists} documents already exist.`);
        return process.exit(1);
    }

    const docs = await oldKTDB.get("tierlistdata").find({
        tierlistID: TIERLIST_ID,
    });

    const newDocs = await Promise.all(docs.map(ConvertFn));

    await db["tierlist-data"].insert(newDocs);
})();
