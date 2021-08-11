// barrel file for re-exporting env variables.
import dotenv from "dotenv";
import JSON5 from "json5";
import fs from "fs";
import p from "prudence";
import { FormatPrError } from "utils/prudence";
import { integer, StaticConfig } from "tachi-common";
dotenv.config(); // imports things like NODE_ENV from a local .env file if one is present.

// stub - having a real logger here creates a circular dependency.r
const logger = console; // CreateLogCtx(__filename);

const confLocation = process.env.TCHIS_CONF_LOCATION ?? "./conf.json5";

// reads from $pwd/conf.json5, unless an override is set
let confFile;

try {
	confFile = fs.readFileSync(confLocation, "utf-8");
} catch (err) {
	logger.error("Error while trying to open conf.json5. Is one present?", { err });
	process.exit(1);
}

const config = JSON5.parse(confFile);

function isValidURL(self: unknown) {
	if (typeof self !== "string") {
		return `Expected URL, received type ${typeof self}`;
	}

	try {
		new URL(self);
		return true;
	} catch (err) {
		return `Invalid URL ${self}.`;
	}
}

interface OAuth2Info {
	CLIENT_ID: string;
	CLIENT_SECRET: string;
}

export interface TachiConfig {
	MONGO_CONNECTION_URL: string;
	MONGO_DATABASE_NAME: string;
	LOG_LEVEL: "debug" | "verbose" | "info" | "warn" | "error" | "severe" | "crit";
	CAPTCHA_SECRET_KEY: string;
	SESSION_SECRET: string;
	FLO_API_URL: string;
	EAG_API_URL: string;
	MIN_API_URL: string;
	ARC_API_URL: string;
	FLO_OAUTH2_INFO?: OAuth2Info;
	EAG_OAUTH2_INFO?: OAuth2Info;
	MIN_OAUTH2_INFO?: OAuth2Info;
	ARC_AUTH_TOKEN: string;
	CDN_FILE_ROOT: string;
	TYPE: "ktchi" | "btchi" | "omni";
	PORT: integer;
	ENABLE_SERVER_HTTPS?: boolean;
	RUN_OWN_CDN?: boolean;
	CLIENT_DEV_SERVER?: string | null;
	SERVER_TYPE_INFO: StaticConfig.ServerConfig;
}

const isValidOauth2 = p.optional({
	CLIENT_ID: "string",
	CLIENT_SECRET: "string",
});

const err = p(config, {
	MONGO_CONNECTION_URL: "string",
	MONGO_DATABASE_NAME: "string",
	LOG_LEVEL: p.isIn("debug", "verbose", "info", "warn", "error", "severe", "crit"),
	CAPTCHA_SECRET_KEY: "string",
	SESSION_SECRET: "string",
	FLO_API_URL: isValidURL,
	EAG_API_URL: isValidURL,
	MIN_API_URL: isValidURL,
	ARC_API_URL: isValidURL,
	FLO_OAUTH2_INFO: isValidOauth2,
	EAG_OAUTH2_INFO: isValidOauth2,
	MIN_OAUTH2_INFO: isValidOauth2,
	ARC_AUTH_TOKEN: "string",
	CDN_FILE_ROOT: "string",
	PORT: p.isPositiveInteger,
	ENABLE_SERVER_HTTPS: "*boolean",
	RUN_OWN_CDN: "*boolean",
	CLIENT_DEV_SERVER: "*?string",
	TYPE: p.isIn("ktchi", "btchi", "omni"),
});

if (err) {
	throw FormatPrError(err, "Invalid conf.json5 file.");
}

if (config.TYPE === "ktchi") {
	config.SERVER_TYPE_INFO = StaticConfig.KTCHI_CONFIG;
} else if (config.TYPE === "btchi") {
	config.SERVER_TYPE_INFO = StaticConfig.BTCHI_CONFIG;
} else if (config.TYPE === "omni") {
	config.SERVER_TYPE_INFO = StaticConfig.OMNI_CONFIG;
}

const tachiConfig = config as TachiConfig;

export const ServerTypeInfo = tachiConfig.SERVER_TYPE_INFO;
export const ServerConfig = tachiConfig;
