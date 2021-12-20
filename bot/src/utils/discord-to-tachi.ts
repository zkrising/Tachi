import { LoggerLayers } from "../config";
import { createLayeredLogger } from "./logger";
import db, { DiscordUserMapDocument } from "../mongo/mongo";

const logger = createLayeredLogger(LoggerLayers.tachiLinker);

export const getTachiIdByDiscordId = async (discordId: string): Promise<DiscordUserMapDocument | undefined> => {
	logger.info(`Fetching linked ID for ${discordId}`);
	try {
		const document = await db.discordUserMap.findOne({ discordID: discordId });
		if (document) {
			return document;
		} else {
			logger.error("Failed to find document for user");
		}
	} catch (e) {
		logger.error(e);
	}

	return undefined;
};
