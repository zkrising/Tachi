import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { StaticConfig } from "tachi-common";

const logger = CreateLogCtx(__filename);

(async () => {
	for (const game of StaticConfig.allSupportedGames) {
		// eslint-disable-next-line no-await-in-loop
		await db.songs[game].update(
			{},
			{ $rename: { "alt-titles": "altTitles", "search-titles": "searchTerms" } },
			{ multi: true }
		);

		logger.info(`Refactored title names for ${game}.`);
	}

	logger.info(`Done.`);
	process.exit(0);
})();
