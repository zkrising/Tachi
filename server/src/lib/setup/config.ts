/* eslint-disable no-console */
// barrel file for re-exporting env variables.
import dotenv from "dotenv";
import JSON5 from "json5";
import { p } from "prudence";
import { allSupportedGames } from "tachi-common";
import { allImportTypes } from "tachi-common/constants/import-types";
import { FormatPrError } from "utils/prudence";
import fs from "fs";
import { URL } from "url";
import type { SendMailOptions } from "nodemailer";
import type { TachiServerCoreConfig, integer } from "tachi-common";

// imports things like NODE_ENV from a local .env file if one is present.
dotenv.config();

// stub - having a real logger here creates a circular dependency.
const logger = console;

const confLocation = process.env.TCHIS_CONF_LOCATION ?? "./conf.json5";

// reads from $pwd/conf.json5, unless an override is set
let confFile;

try {
	confFile = fs.readFileSync(confLocation, "utf-8");
} catch (err) {
	logger.error("Error while trying to open conf.json5. Is one present?", {
		err,
	});

	process.exit(1);
}

const config: unknown = JSON5.parse(confFile);

function isValidURL(self: unknown) {
	if (typeof self !== "string") {
		return `Expected URL, received type ${typeof self}`;
	}

	try {
		// eslint-disable-next-line no-new
		new URL(self);
		return true;
	} catch (err) {
		return `Invalid URL ${self} (${(err as Error).message}).`;
	}
}

export interface OAuth2Info {
	CLIENT_ID: string;
	CLIENT_SECRET: string;
	REDIRECT_URI: string;
}

export interface CGConfig {
	API_KEY: string;
	URL: string;
}

export interface TachiServerConfig {
	MONGO_DATABASE_NAME: string;
	CAPTCHA_SECRET_KEY: string;
	SESSION_SECRET: string;
	FLO_API_URL?: string;
	EAG_API_URL?: string;
	MIN_API_URL?: string;
	ARC_API_URL?: string;
	MYT_API_HOST?: string;

	CG_DEV_CONFIG?: CGConfig;
	CG_NAG_CONFIG?: CGConfig;
	CG_GAN_CONFIG?: CGConfig;

	FLO_OAUTH2_INFO?: OAuth2Info;
	EAG_OAUTH2_INFO?: OAuth2Info;
	MIN_OAUTH2_INFO?: OAuth2Info;
	ARC_AUTH_TOKEN?: string;
	MYT_AUTH_TOKEN?: string;
	ENABLE_SERVER_HTTPS?: boolean;
	CLIENT_DEV_SERVER?: string | null;
	RATE_LIMIT: integer;
	OAUTH_CLIENT_CAP: integer;
	OPTIONS_ALWAYS_SUCCEEDS?: boolean;
	USE_EXTERNAL_SCORE_IMPORT_WORKER: boolean;
	EXTERNAL_SCORE_IMPORT_WORKER_CONCURRENCY?: integer;
	ENABLE_METRICS: boolean;
	SEEDS_CONFIG?: {
		REPO_URL: string;
		USER_NAME: string | null;
		USER_EMAIL: string | null;
		BRANCH?: string;
	};
	EMAIL_CONFIG?: {
		FROM: string;
		DKIM?: SendMailOptions["dkim"];

		// @warning This is explicitly allowed to be any
		// As nodemailer doesnt properly export the types we care about
		// This should be set to SMTPTransport.Options, but it is
		// inaccessible.
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		TRANSPORT_OPS: any;
	};
	USC_QUEUE_SIZE: integer;
	BEATORAJA_QUEUE_SIZE: integer;
	MAX_GOAL_SUBSCRIPTIONS: integer;
	MAX_QUEST_SUBSCRIPTIONS: integer;
	MAX_FOLLOWING_AMOUNT: integer;
	MAX_RIVALS: integer;
	OUR_URL: string;
	ALLOW_RUNNING_OFFLINE?: boolean;
	INVITE_CODE_CONFIG?: {
		BATCH_SIZE: integer;
		INVITE_CAP: integer;
		BETA_USER_BONUS: integer;
	};
	TACHI_CONFIG: TachiServerCoreConfig;
	CDN_CONFIG: {
		WEB_LOCATION: string;
		SAVE_LOCATION:
			| {
					TYPE: "S3_BUCKET";
					ENDPOINT: string;
					ACCESS_KEY_ID: string;
					SECRET_ACCESS_KEY: string;
					BUCKET: string;
					KEY_PREFIX?: string;
					REGION?: string;
			  }
			| { TYPE: "LOCAL_FILESYSTEM"; LOCATION: string; SERVE_OWN_CDN?: boolean };
	};
}

const isValidOauth2 = p.optional({
	CLIENT_ID: "string",
	CLIENT_SECRET: "string",
	REDIRECT_URI: "string",
});

const isValidCGConfig = p.optional({
	API_KEY: "string",
	URL: "string",
});

const err = p(config, {
	MONGO_DATABASE_NAME: "string",
	CAPTCHA_SECRET_KEY: "string",
	SESSION_SECRET: "string",
	FLO_API_URL: p.optional(isValidURL),
	EAG_API_URL: p.optional(isValidURL),
	MIN_API_URL: p.optional(isValidURL),
	ARC_API_URL: p.optional(isValidURL),
	MYT_API_HOST: "*string",

	CG_DEV_CONFIG: isValidCGConfig,
	CG_NAG_CONFIG: isValidCGConfig,
	CG_GAN_CONFIG: isValidCGConfig,

	FLO_OAUTH2_INFO: isValidOauth2,
	EAG_OAUTH2_INFO: isValidOauth2,
	MIN_OAUTH2_INFO: isValidOauth2,
	ARC_AUTH_TOKEN: "*string",
	MYT_AUTH_TOKEN: "*string",
	ENABLE_SERVER_HTTPS: "*boolean",
	CLIENT_DEV_SERVER: "*?string",
	RATE_LIMIT: p.optional(p.isPositiveInteger),
	OAUTH_CLIENT_CAP: p.optional(p.isPositiveInteger),
	OPTIONS_ALWAYS_SUCCEEDS: "*boolean",
	USE_EXTERNAL_SCORE_IMPORT_WORKER: "*boolean",
	EXTERNAL_SCORE_IMPORT_WORKER_CONCURRENCY: p.optional(p.isPositiveInteger),
	ALLOW_RUNNING_OFFLINE: "*boolean",
	ENABLE_METRICS: "*boolean",
	EMAIL_CONFIG: p.optional({
		FROM: "string",
		DKIM: "*object",

		// WARN: This validation is improper and lazy.
		// The actual content is just some wacky options object.
		// I'm not going to assert this properly.
		TRANSPORT_OPS: "*object",
	}),
	USC_QUEUE_SIZE: p.optional(p.gteInt(2)),
	BEATORAJA_QUEUE_SIZE: p.optional(p.gteInt(2)),
	MAX_GOAL_SUBSCRIPTIONS: p.optional(p.isPositiveInteger),
	MAX_QUEST_SUBSCRIPTIONS: p.optional(p.isPositiveInteger),
	MAX_FOLLOWING_AMOUNT: p.optional(p.isPositiveInteger),
	MAX_RIVALS: p.optional(p.isPositiveInteger),
	OUR_URL: (self) => {
		if (typeof self !== "string") {
			return "Expected a string.";
		}

		if (self.endsWith("/")) {
			return `OUR_URL should not end with a trailing slash. Use ${self.substring(
				0,
				self.length - 1
			)} instead.`;
		}

		return true;
	},
	INVITE_CODE_CONFIG: p.optional({
		BATCH_SIZE: p.isPositiveInteger,
		INVITE_CAP: p.isPositiveInteger,
		BETA_USER_BONUS: p.isPositiveInteger,
	}),
	TACHI_CONFIG: {
		NAME: "string",
		TYPE: p.isIn("kamai", "boku", "omni"),
		GAMES: [p.isIn(allSupportedGames)],
		IMPORT_TYPES: [p.isIn(allImportTypes)],
		SIGNUPS_ENABLED: p.optional("boolean"),
	},
	CDN_CONFIG: {
		WEB_LOCATION: "string",
		SAVE_LOCATION: p.or(
			{
				TYPE: p.is("LOCAL_FILESYSTEM"),
				SERVE_OWN_CDN: "*boolean",
				LOCATION: "string",
			},
			{
				TYPE: p.is("S3_BUCKET"),
				ENDPOINT: "string",
				ACCESS_KEY_ID: "string",
				SECRET_ACCESS_KEY: "string",
				BUCKET: "string",
				KEY_PREFIX: "*string",
				REGION: "*string",
			}
		),
	},
	SEEDS_CONFIG: p.optional({
		REPO_URL: "string",
		USER_NAME: "?string",
		USER_EMAIL: "?string",
		BRANCH: "*string",
	}),
});

if (err) {
	throw new Error(FormatPrError(err, "Invalid conf.json5 file."));
}

const tachiServerConfig = config as TachiServerConfig;

// default rate limit 500
tachiServerConfig.RATE_LIMIT ??= 500;
tachiServerConfig.OAUTH_CLIENT_CAP ??= 15;
tachiServerConfig.USC_QUEUE_SIZE ??= 3;
tachiServerConfig.BEATORAJA_QUEUE_SIZE ??= 3;
tachiServerConfig.MAX_GOAL_SUBSCRIPTIONS ??= 1_000;
tachiServerConfig.MAX_QUEST_SUBSCRIPTIONS ??= 100;
tachiServerConfig.MAX_RIVALS ??= 5;
tachiServerConfig.MAX_FOLLOWING_AMOUNT ??= 1_000;
tachiServerConfig.USE_EXTERNAL_SCORE_IMPORT_WORKER ??= false;
tachiServerConfig.TACHI_CONFIG.SIGNUPS_ENABLED ??= true;
tachiServerConfig.ENABLE_METRICS ??= false;

export const TachiConfig = tachiServerConfig.TACHI_CONFIG;
export const ServerConfig = tachiServerConfig;

// Environment Variable Validation

let port = Number(process.env.PORT);

if (Number.isNaN(port) && process.env.IS_SERVER) {
	logger.warn(`No/invalid PORT specified in environment, defaulting to 8080.`);
	port = 8080;
}

const redisUrl = process.env.REDIS_URL ?? "";

if (!redisUrl) {
	// n.b. These logs should be critical level, but the logger cant actually instantiate
	// itself in this file, because this file also controlls the logger. Ouch!
	logger.error(`No REDIS_URL specified in environment. Terminating.`);
	process.exit(1);
}

const mongoUrl = process.env.MONGO_URL ?? "";

if (!mongoUrl) {
	logger.error(`No MONGO_URL specified in environment. Terminating.`);
	process.exit(1);
}

const nodeEnv = process.env.NODE_ENV ?? "";

if (!nodeEnv) {
	logger.error(`No NODE_ENV specified in environment. Terminating.`);
	process.exit(1);
}

if (!["dev", "production", "staging", "test"].includes(nodeEnv)) {
	logger.error(
		`Invalid NODE_ENV set in environment. Expected dev, production, test or staging. Got ${nodeEnv}.`
	);
	process.exit(1);
}

// if (bms XOR popn) is enabled
if (TachiConfig.GAMES.includes("bms") !== TachiConfig.GAMES.includes("pms")) {
	logger.error(
		`BMS and PMS MUST be enabled at the same time, due to how the beatoraja IR works.`
	);

	process.exit(1);
}

const logLevel = process.env.LOG_LEVEL ?? "info";

if (!["crit", "severe", "error", "warn", "info", "verbose", "debug"].includes(logLevel)) {
	logger.error(`Invalid LOG_LEVEL of ${logLevel}.`);

	process.exit(1);
}

const replicaIdentity = process.env.REPLICA_IDENTITY;

export const Environment = {
	port,
	redisUrl,
	mongoUrl,
	nodeEnv: nodeEnv as "dev" | "production" | "staging" | "test",
	replicaIdentity,
	commitHash: process.env.COMMIT_HASH,
	seqUrl: process.env.SEQ_URL,
	seqApiKey: process.env.SEQ_API_KEY,
	logLevel: logLevel as "crit" | "debug" | "error" | "info" | "severe" | "verbose" | "warn",
};
