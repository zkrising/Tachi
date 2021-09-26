import { LoggerLayers } from "../config";
import { createLayeredLogger } from "./logger";
const logger = createLayeredLogger(LoggerLayers.tachiLinker);

/** @TODO Stub */
export const getTachiIdByDiscordId = (discordId: string): string => {
	/** @TODO Hit an internal database to grab user id */
	logger.info(`Fetching linked ID for ${discordId}`);
	return "0";
};
