import { LoggerLayers } from "../data/data";
import { CreateLayeredLogger } from "../utils/logger";
import db, { DiscordUserMapDocument } from "./mongo";

const logger = CreateLayeredLogger(LoggerLayers.databaseQuery);

export function GetUserForDiscordID(discordID: string): Promise<DiscordUserMapDocument | null> {
	logger.verbose(`Fetching linked user with DiscordID: ${discordID}.`);

	return db.discordUserMap.findOne({ discordID: discordID });
}
