import db from "./mongo";
import { LoggerLayers } from "../data/data";
import { CreateLayeredLogger } from "../utils/logger";
import type { DiscordUserMapDocument } from "./documents";
import type { integer } from "tachi-common";

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
