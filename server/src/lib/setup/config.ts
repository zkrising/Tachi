// barrel file for re-exporting env variables.
import dotenv from "dotenv";
import JSON5 from "json5";
import fs from "fs";
import p from "prudence";
import { FormatPrError } from "../../utils/prudence";
import { integer, StaticConfig } from "tachi-common";
dotenv.config(); // imports things like NODE_ENV from a local .env file if one is present.

// reads from $pwd/conf.json5
const confFile = fs.readFileSync("./conf.json5", "utf-8");

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

export interface TachiConfig {
	MONGO_CONNECTION_URL: string;
	MONGO_DATABASE_NAME: string;
	LOG_LEVEL: "debug" | "verbose" | "info" | "warn" | "error" | "severe" | "crit";
	CAPTCHA_SECRET_KEY: string;
	SESSION_SECRET: string;
	FLO_API_URL: string;
	EAG_API_URL: string;
	ARC_API_URL: string;
	ARC_AUTH_TOKEN: string;
	CDN_ROOT: string;
	CDN_URL: string | null;
	TYPE: "ktchi" | "btchi" | "omni";
	PORT: integer;
	TYPE_INFO: StaticConfig.ServerConfig;
}

const err = p(config, {
	MONGO_CONNECTION_URL: "string",
	MONGO_DATABASE_NAME: "string",
	LOG_LEVEL: p.isIn("debug", "verbose", "info", "warn", "error", "severe", "crit"),
	CAPTCHA_SECRET_KEY: "string",
	SESSION_SECRET: "string",
	FLO_API_URL: isValidURL,
	EAG_API_URL: isValidURL,
	ARC_API_URL: isValidURL,
	ARC_AUTH_TOKEN: "string",
	CDN_ROOT: "string",
	CDN_URL: "?string",
	PORT: p.isPositiveInteger,
	TYPE: p.isIn("ktchi", "btchi", "omni"),
});

if (err) {
	throw FormatPrError(err, "Invalid conf.json5 file.");
}

if (config.TYPE === "ktchi") {
	config.TYPE_INFO = StaticConfig.KTCHI_CONFIG;
} else if (config.TYPE === "btchi") {
	config.TYPE_INFO = StaticConfig.BTCHI_CONFIG;
} else if (config.TYPE === "omni") {
	config.TYPE_INFO = StaticConfig.OMNI_CONFIG;
}

const tachiConfig = config as TachiConfig;

export const MONGO_CONNECTION_URL = tachiConfig.MONGO_CONNECTION_URL;
export const MONGO_DATABASE_NAME = tachiConfig.MONGO_DATABASE_NAME;
export const LOG_LEVEL = tachiConfig.LOG_LEVEL;
export const SESSION_SECRET = tachiConfig.SESSION_SECRET;
export const CAPTCHA_SECRET_KEY = tachiConfig.CAPTCHA_SECRET_KEY;
export const FLO_API_URL = tachiConfig.FLO_API_URL;
export const EAG_API_URL = tachiConfig.EAG_API_URL;
export const ARC_API_URL = tachiConfig.ARC_API_URL;
export const ARC_AUTH_TOKEN = tachiConfig.ARC_AUTH_TOKEN;
export const CDN_ROOT = tachiConfig.CDN_ROOT;
export const CDN_URL = tachiConfig.CDN_URL;
export const CONF_INFO = tachiConfig.TYPE_INFO;
export const PORT = tachiConfig.PORT;
export const CONFIG = tachiConfig;
