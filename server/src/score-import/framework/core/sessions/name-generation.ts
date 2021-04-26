import db from "../../../../db/db";
import { KtLogger } from "../../../../types";

export async function GenerateRandomSessionName(logger: KtLogger) {
    let adjectives = await db.adjectives.aggregate([
        {
            $sample: {
                size: 2,
            },
        },
    ]);

    let nouns = await db.nouns.aggregate([
        {
            $sample: {
                size: 1,
            },
        },
    ]);

    if (adjectives.length < 2) {
        logger.severe(
            `Could not source 2 adjectives from the adjectives DB. Filling in with defaults, but this should be investigated.`
        );

        adjectives = ["Ambient", "Scary"];
    }

    if (nouns.length < 1) {
        logger.severe(
            `Could not source a noun from the noun DB. Filling in with defaults, but this should be investigated.`
        );

        nouns = ["Noise"];
    }

    return `${adjectives[0].text} ${adjectives[1].text} ${nouns[0].text}`;
}
