import { Snowflake } from "discord.js/typings/index.js";
import monk from "monk";
import { integer } from "tachi-common";
import { LoggerLayers } from "../data/data";
import { ProcessEnv } from "../setup";
import { createLayeredLogger } from "../utils/logger";

const logger = createLayeredLogger(LoggerLayers.database);

logger.info(`Connecting to ${ProcessEnv.MONGO_URL}...`);

const monkDB = monk(ProcessEnv.MONGO_URL);

monkDB
	.then(() => {
		logger.info(`Database connection successful.`, {
			bootInfo: true,
		});
	})
	.catch((err) => {
		logger.crit(err);
		process.exit(1);
	});

export interface DiscordUserMapDocument {
	userID: integer;
	discordID: Snowflake;
	tachiApiToken: string;
}

const db = {
	discordUserMap: monkDB.get<DiscordUserMapDocument>("discord-user-map"),
};

export default db;
