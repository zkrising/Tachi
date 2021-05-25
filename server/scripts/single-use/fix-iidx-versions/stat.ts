import CreateLogCtx from "../../../src/common/logger";
import db from "../../../src/db/db";

const logger = CreateLogCtx(__filename);

(async () => {
    const charts = await db.charts.iidx.find({ versions: { $size: 0 } });

    for (const chart of charts) {
        // eslint-disable-next-line no-await-in-loop
        const song = await db.songs.iidx.findOne({ id: chart.songID });

        if (!song) {
            logger.error(`cannot find parent song ${chart.songID}`);
            continue;
        }

        logger.info(`${song.title} ${chart.playtype} ${chart.difficulty}`);
    }
})();
