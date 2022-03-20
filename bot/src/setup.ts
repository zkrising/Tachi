import { LoggerLayers } from "./data/data";
import { createLayeredLogger } from "./utils/logger";
import { FormatPrError } from "./utils/prudence";
import JSON5 from "json5";
import fs from "fs";
import Prudence from "prudence";
import { config } from "dotenv";

// Initialise .env.
config();

// Reads the bots config file from $pwd/conf.json5.
// Validates it using prudence.

const logger = createLayeredLogger(LoggerLayers.botConfigSetup);

export interface BotConfig {
	SERVER_NAME: string;
	SERVER_PORT: number;
	TACHI_SERVER_LOCATION: string;
	OUR_URL: string;
	GENERIC_ERROR_MESSAGE: string;
	TACHI_NAME: string;
	SERVER_ID: string;
	BOT_CLIENT_SECRET: string;
	BOT_CLIENT_ID: string;
	MONGO_URL: string;
	DISCORD_TOKEN: string;
}

function ParseBotConfig(fileLoc = "conf.json5"): BotConfig {
	let data;

	try {
		const contents = fs.readFileSync(fileLoc, "utf-8");
		data = JSON5.parse(contents);
	} catch (err) {
		logger.error("Failed to find a valid conf.json5 file. Cannot boot.", { err });

		throw err;
	}

	const err = Prudence(data, {
		SERVER_PORT: Prudence.isPositiveNonZeroInteger,
		TACHI_SERVER_LOCATION: "string",
		OUR_URL: "string",
		GENERIC_ERROR_MESSAGE: "string",
		SERVER_NAME: "string",
	});

	if (err) {
		logger.error(FormatPrError(err, "Invalid conf.json5 file. Cannot safely boot."));

		throw err;
	}

	return data;
}

export interface ProcessEnvironment {
	nodeEnv: "production" | "dev" | "staging" | "test";
}

function ParseEnvVars() {
	const err = Prudence(
		process.env,
		{
			NODE_ENV: Prudence.isIn("production", "dev", "staging", "test"),
		},
		{},
		{ allowExcessKeys: true }
	);

	if (err) {
		logger.error(FormatPrError(err, "Invalid environment. Cannot safely boot."));

		throw err;
	}

	return {
		nodeEnv: process.env.NODE_ENV,
	} as ProcessEnvironment;
}

export const BotConfig: BotConfig = ParseBotConfig(process.env.CONF_JSON5_LOCATION);

export const ProcessEnv = ParseEnvVars();
