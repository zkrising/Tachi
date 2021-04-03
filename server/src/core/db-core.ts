import db from "../db";
import createLogCtx from "../logger";
const logger = createLogCtx("db-core.ts");
import { integer } from "../types";

export async function GetNextCounterValue(counterName: string): Promise<integer> {
    const sequenceDoc = await db.get("counters").findOneAndUpdate(
        {
            counterName,
        },
        {
            $inc: {
                value: 1,
            },
        }
    );

    if (!sequenceDoc) {
        logger.error(`Could not find sequence document for ${counterName}`);
        throw new Error(`Could not find sequence document for ${counterName}.`);
    }

    return sequenceDoc.value;
}
