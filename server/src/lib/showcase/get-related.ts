import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import type { Game, ShowcaseStatDetails } from "tachi-common";

const logger = CreateLogCtx(__filename);

export async function GetRelatedStatDocuments(stat: ShowcaseStatDetails, game: Game) {
	switch (stat.mode) {
		case "chart": {
			const chart = await db.charts[game].findOne({ chartID: stat.chartID });

			if (!chart) {
				logger.error(`This stat refers to a chart that does not exist?`, { stat });
				throw new Error(`Stat refers to a chart that does not exist? ${stat.chartID}.`);
			}

			const song = await db.songs[game].findOne({ id: chart.songID });

			if (!song) {
				logger.severe(`Song-Chart Mismatch - ${chart.songID}.`, { chart });
				throw new Error(`Song-Chart Mismatch on ${chart.songID}.`);
			}

			return { song, chart };
		}

		case "folder": {
			if (Array.isArray(stat.folderID)) {
				logger.warn(
					`This stat is corrupt and attempted to use multiple folderIDs. This is no longer supported. Check that migrations have ran.`,
					{ stat }
				);
				throw new Error(`Legacy FolderIDs used in showcase stat.`);
			}

			const folder = await db.folders.findOne({
				folderID: stat.folderID,
			});

			if (!folder) {
				logger.error(`This stat refers to a folder that does not exist?`, { stat });
				throw new Error(`Stat refers to folder that no longer exists.`);
			}

			return { folder };
		}

		default: {
			logger.error(
				`Invalid stat - has nonsense stat.mode of ${(stat as ShowcaseStatDetails).mode}.`,
				{ stat }
			);
			throw new Error(`Invalid stat.mode in stat?`);
		}
	}
}
