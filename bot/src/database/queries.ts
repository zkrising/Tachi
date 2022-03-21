import { LoggerLayers } from "../data/data";
import { CreateLayeredLogger } from "../utils/logger";
import { DiscordUserMapDocument, QuoteDocument } from "./documents";
import db from "./mongo";

const logger = CreateLayeredLogger(LoggerLayers.databaseQuery);

export function GetUserForDiscordID(discordID: string): Promise<DiscordUserMapDocument | null> {
	logger.verbose(`Fetching linked user with DiscordID: ${discordID}.`);

	return db.discordUserMap.findOne({ discordID: discordID });
}

export function GetQuoteWithID(quoteID: string): Promise<QuoteDocument | null> {
	logger.verbose(`Fetching quote with quoteID: ${quoteID}.`);

	return db.quotes.findOne({ quoteID });
}
