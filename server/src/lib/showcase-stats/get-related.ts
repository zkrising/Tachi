import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { Game, ShowcaseStatDetails } from "tachi-common";

const logger = CreateLogCtx(__filename);

export async function GetRelatedStatDocuments(stat: ShowcaseStatDetails, game: Game) {
	if (stat.mode === "chart") {
		const chart = await db.charts[game].findOne({ chartID: stat.chartID });

		if (!chart) {
			logger.error(`This stat refers to a chart that does not exist?`, { stat });
			throw new Error(`Stat refers to a chart that does not exist? ${stat.chartID}.`);
		}

		const song = await db.songs[game].findOne({ id: chart?.songID });

		if (!song) {
			logger.severe(`Song-Chart Mismatch - ${chart.songID}.`, { chart });
			throw new Error(`Song-Chart Mismatch on ${chart.songID}.`);
		}

		return { song, chart };
	} else if (stat.mode === "folder") {
		const folders = await db.folders.find({
			folderID: { $in: Array.isArray(stat.folderID) ? stat.folderID : [stat.folderID] },
		});

		return { folders };
	}

	logger.error(`Invalid stat - has nonsense stat.mode.`, { stat });
	throw new Error(`Invalid stat.mode in stat?`);
}
