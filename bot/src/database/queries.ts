import { DiscordUserMapDocument, QuoteDocument } from "./documents";
import { CreateLayeredLogger } from "../utils/logger";
import { LoggerLayers } from "../data/data";
import { integer } from "tachi-common";
import db from "./mongo";

const logger = CreateLayeredLogger(LoggerLayers.databaseQuery);

export function GetUserAndTokenForDiscordID(
	discordID: string
): Promise<DiscordUserMapDocument | null> {
	logger.verbose(`Fetching linked user & token with DiscordID: ${discordID}.`);

	return db.discordUserMap.findOne({ discordID });
}

export async function GetUserIDForDiscordID(discordID: string): Promise<integer | null> {
	logger.verbose(`Fetching linked user & token with DiscordID: ${discordID}.`);

	const user = await db.discordUserMap.findOne({ discordID }, { projection: { userID: 1 } });

	if (!user) {
		return null;
	}

	return user.userID;
}

export function GetQuoteWithID(quoteID: string): Promise<QuoteDocument | null> {
	logger.verbose(`Fetching quote with quoteID: ${quoteID}.`);

	return db.quotes.findOne({ quoteID });
}
