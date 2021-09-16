import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { ServerTypeInfo } from "lib/setup/config";

const logger = CreateLogCtx(__filename);

if (require.main === module) {
	(async () => {
		for (const game of ServerTypeInfo.supportedGames) {
			// eslint-disable-next-line no-await-in-loop
			const res = await db.charts[game].update(
				{ tierlistInfo: { $exists: false } },
				{ $set: { tierlistInfo: {} } },
				{ multi: true }
			);

			logger.info(`Added tierlistInfo to ${game}'s charts.`, { res });
		}
	})();
}
