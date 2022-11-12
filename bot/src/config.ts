import { IsRecord } from "./utils/predicates";
import { FormatPrError } from "./utils/prudence";
import { config } from "dotenv";
import JSON5 from "json5";
// eslint-disable-next-line import/order
import p from "prudence";

// @ts-expect-error No types available...
import fetchSync from "sync-fetch";
import fs from "fs";
import type { ServerConfig as ServerConfigType } from "./utils/returnTypes";
import type { Game, integer } from "tachi-common";

// Initialise .env.
config();

// Reads the bots config file from $pwd/conf.json5.
// Validates it using prudence.

// the real logger tries to bind to discord, and is dependent on the options
// below.
const logger = console;

export interface BotConfig {
	TACHI_SERVER_LOCATION: string;
	HTTP_SERVER: {
		URL: string;
	};
	OAUTH: {
		CLIENT_SECRET: string;
		CLIENT_ID: string;
	};
	DISCORD: {
		TOKEN: string;
		SERVER_ID: string;
		GAME_CHANNELS: Partial<Record<Game, string>>;
		ADMIN_USERS: Array<string>;
	};
	LOGGER?: {
		SEQ_API_KEY?: string;
	};
}

function ParseBotConfig(fileLoc = "conf.json5"): BotConfig {
	let data;

	try {
		const contents = fs.readFileSync(fileLoc, "utf-8");

		data = JSON5.parse(contents);
	} catch (err) {
		logger.error("Failed to find/parse a valid conf.json5 file. Cannot boot.", { err });

		throw err;
	}

	const err = p(data, {
		TACHI_SERVER_LOCATION: "string",
		HTTP_SERVER: {
			URL: "string",
		},
		OAUTH: {
			CLIENT_SECRET: "string",
			CLIENT_ID: "string",
		},
		DISCORD: {
			TOKEN: "string",
			SERVER_ID: "string",
			GAME_CHANNELS: (self) => {
				if (!IsRecord(self)) {
					return "Expected an object that maps games to discord channel IDs.";
				}

				for (const [key, value] of Object.entries(self)) {
					// note: properly validating that these are valid games
					// is slightly harder, since that is also controlled by the config.
					// ah well.
					if (typeof key !== "string" || typeof value !== "string") {
						return `Invalid value ${key}:${value}. Expected two strings.`;
					}
				}

				return true;
			},

			// A list of users that are allowed to do powerful stuff.
			ADMIN_USERS: ["string"],
		},
		LOGGER: p.optional({
			SEQ_API_KEY: "*string",
		}),
	});

	if (err) {
		logger.error(FormatPrError(err, "Invalid conf.json5 file. Cannot safely boot."));

		throw err;
	}

	return data;
}

export interface ProcessEnvironment {
	nodeEnv: "dev" | "production" | "staging" | "test";
	mongoUrl: string;
	port: integer;
	seqUrl?: string;
}

function ParseEnvVars() {
	const err = p(
		process.env,
		{
			NODE_ENV: p.isIn("production", "dev", "staging", "test"),

			// mei implicitly reads this.
			LOG_LEVEL: p.optional(
				p.isIn("debug", "verbose", "info", "warn", "error", "severe", "crit")
			),
			MONGO_URL: "string",
			PORT: (self) =>
				p.isPositiveInteger(Number(self)) === true ||
				"Should be a string representing a whole integer port.",
			SEQ_URL: "*string",
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
		mongoUrl: process.env.MONGO_URL,
		port: Number(process.env.PORT),
		seqUrl: process.env.SEQ_URL,
	} as ProcessEnvironment;
}

export const BotConfig: BotConfig = ParseBotConfig(process.env.CONF_JSON5_LOCATION);

// The Tachi Server exports all of the information about it. This saves us having to
// sync more metadata across instances.
function GetServerConfig() {
	// Yes, I know synchronous fetch is disgusting. However, we can't do anything until
	// this fetch is complete, and it saves us having to do a singleton pattern or worse.
	// This *should* be solved with top-level-await, but good luck actually getting
	// typescript to output the right stuff here.
	const res = fetchSync(`${BotConfig.TACHI_SERVER_LOCATION}/api/v1/config`).json();

	if (!res.success) {
		logger.error(
			`Failed to fetch server info from ${BotConfig.TACHI_SERVER_LOCATION}. Can't run.`
		);
		process.exit(1);
	}

	return res.body as ServerConfigType;
}

export const ServerConfig = GetServerConfig();

export const ProcessEnv = ParseEnvVars();

// General warnings for config misuse.
// This warns people if their parent server supports games that they aren't acknowledging.
for (const game of ServerConfig.games) {
	if (!Object.prototype.hasOwnProperty.call(BotConfig.DISCORD.GAME_CHANNELS, game)) {
		logger.warn(
			`${ServerConfig.name} declares support for ${game}, but no channel is mapped to it in your conf.json5.`
		);
	}
}
