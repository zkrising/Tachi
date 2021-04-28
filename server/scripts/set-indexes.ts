import monk from "monk";
import { Command } from "commander";
import CreateLogCtx from "../src/logger";
import { IndexOptions } from "mongodb";
import { ValidDatabases } from "kamaitachi-common";

const logger = CreateLogCtx("set-indexes.ts");

const program = new Command();

program.option("-d, --db <database>", "The database to index.");
program.option(
    "-r, --reset",
    "Whether to reset all indexes on this database before indexing or not."
);

program.parse(process.argv);
const options = program.opts();

const db = monk(`${process.env.MONGO_BASE_URL ?? "127.0.0.1"}/${options.db}`);

interface Index {
    fields: Record<string, unknown>;
    options?: IndexOptions;
}

function index(fields: Record<string, unknown>, options?: IndexOptions) {
    return { fields, options };
}

const UNIQUE = { unique: true };

const indexes: Partial<Record<ValidDatabases, Index[]>> = {
    scores: [index({ scoreID: 1 }, UNIQUE)],
    "charts-iidx": [
        index({ chartID: 1 }, UNIQUE),
        index({ songID: 1, difficulty: 1, playtype: 1, isPrimary: 1 }, UNIQUE),
    ],
    "songs-iidx": [index({ id: 1 }, UNIQUE), index({ title: 1 })],
    sessions: [
        // lol
        index({ timeStarted: 1, timeEnded: 1, userID: 1, game: 1, playtype: 1 }),
    ],
};

(async () => {
    logger.info(`Starting indexing for ${options.db}...`);

    for (const collection in indexes) {
        if (options.reset) {
            // eslint-disable-next-line no-await-in-loop
            await db.get(collection).dropIndexes();
        }

        // @ts-expect-error yeah blah blah
        for (const index of indexes[collection]) {
            // eslint-disable-next-line no-await-in-loop
            let r = await db.get(collection).createIndex(index.fields, index.options);

            logger.info(r);
        }
    }

    logger.info("Done.");
})();
