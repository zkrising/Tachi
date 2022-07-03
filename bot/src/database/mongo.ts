import { ProcessEnv } from "../config";
import { LoggerLayers } from "../data/data";
import { CreateLayeredLogger } from "../utils/logger";
import monk from "monk";
import type { DiscordUserMapDocument, QuoteDocument } from "./documents";

const logger = CreateLayeredLogger(LoggerLayers.database);

logger.info(`Connecting to ${ProcessEnv.mongoUrl}...`);

const monkDB = monk(ProcessEnv.mongoUrl);

monkDB
	.then(() => {
		logger.info(`Database connection successful.`);
	})
	.catch((err) => {
		logger.crit(err);
		process.exit(1);
	});

const db = {
	discordUserMap: monkDB.get<DiscordUserMapDocument>("discord-user-map"),
	quotes: monkDB.get<QuoteDocument>("quotes"),
};

export async function SetIndexes(hardReset = false) {
	logger.info(`Recieved request to set indexes.`);

	if (hardReset) {
		logger.warn(`Hard resetting indexes!`);
		await db.discordUserMap.dropIndexes();
		await db.quotes.dropIndexes();
	}

	await db.discordUserMap.createIndex({ discordID: 1 }, { unique: true });
	await db.quotes.createIndex({ quoteID: 1 }, { unique: true });

	logger.info(`Indexes have been set.`);
}

export default db;
