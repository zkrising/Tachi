import { Snowflake } from "discord.js/typings/index.js";
import monk from "monk";
import { integer } from "tachi-common";
import { LoggerLayers } from "../data/data";
import { BotConfig } from "../config";
import { CreateLayeredLogger } from "../utils/logger";

const logger = CreateLayeredLogger(LoggerLayers.database);

logger.info(`Connecting to ${BotConfig.MONGO_URL}...`);

const monkDB = monk(BotConfig.MONGO_URL);

monkDB
	.then(() => {
		logger.info(`Database connection successful.`);
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

export async function SetIndexes(hardReset = false) {
	logger.info(`Recieved request to set indexes.`);

	if (hardReset) {
		logger.warn(`Hard resetting indexes!`);
		await db.discordUserMap.dropIndexes();
	}

	await db.discordUserMap.createIndex({ discordID: 1 }, { unique: true });

	logger.info(`Indexes have been set.`);
}

export default db;
