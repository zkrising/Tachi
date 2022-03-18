import { LoggerLayers } from "../config";
import { createLayeredLogger } from "./logger";
import db, { DiscordUserMapDocument } from "../mongo/mongo";
import { Interaction } from "discord.js";

const logger = createLayeredLogger(LoggerLayers.tachiAuth);

export async function GetRequestingUserInfo(
	interaction: Interaction
): Promise<DiscordUserMapDocument | null> {
	const discordID = interaction.id;

	logger.verbose(`Fetching linked ID for ${discordID}`);

	return db.discordUserMap.findOne({ discordID: discordID });
}
