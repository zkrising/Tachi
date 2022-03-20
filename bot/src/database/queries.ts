import { LoggerLayers } from "../data/data";
import { createLayeredLogger } from "../utils/logger";
import db, { DiscordUserMapDocument } from "./mongo";

const logger = createLayeredLogger(LoggerLayers.databaseQuery);

export function GetUserForDiscordID(discordID: string): Promise<DiscordUserMapDocument | null> {
	logger.verbose(`Fetching linked user for DiscordID: ${discordID}`);

	return db.discordUserMap.findOne({ discordID: discordID });
}
