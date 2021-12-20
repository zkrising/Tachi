import { LoggerLayers } from "../config";
import { createLayeredLogger } from "./logger";
import db, { DiscordUserMapDocument } from "../mongo/mongo";

const logger = createLayeredLogger(LoggerLayers.tachiAuth);

export const getTachiIdByDiscordId = async (discordId: string): Promise<DiscordUserMapDocument | undefined> => {
	logger.verbose(`Fetching linked ID for ${discordId}`);
	try {
		const document = await db.discordUserMap.findOne({ discordID: discordId });
		if (document) {
			return document;
		}
	} catch (e) {
		logger.error(e);
	}

	return undefined;
};
