// barrel file for re-exporting env variables.
import dotenv from "dotenv";
import JSON5 from "json5";
import fs from "fs";
import p from "prudence";
import { FormatPrError } from "../../utils/prudence";
import { integer, Game } from "tachi-common";
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
    MONGO_BASE_URL: string;
    LOG_LEVEL: "debug" | "verbose" | "info" | "warn" | "error" | "severe" | "crit";
    CAPTCHA_SECRET_KEY: string;
    SESSION_SECRET: string;
    FLO_API_URL: string;
    EAG_API_URL: string;
    ARC_API_URL: string;
    ARC_AUTH_TOKEN: string;
    CDN_ROOT: string;
    TYPE: "ktchi" | "btchi" | "omni";
    PORT: integer;
    TYPE_INFO: {
        NAME: string;
        SUPPORTED_GAMES: Game[];
    };
}

const err = p(config, {
    MONGO_BASE_URL: "string",
    LOG_LEVEL: p.isIn("debug", "verbose", "info", "warn", "error", "severe", "crit"),
    CAPTCHA_SECRET_KEY: "string",
    SESSION_SECRET: "string",
    FLO_API_URL: isValidURL,
    EAG_API_URL: isValidURL,
    ARC_API_URL: isValidURL,
    ARC_AUTH_TOKEN: "string",
    CDN_ROOT: "string",
    PORT: p.isPositiveInteger,
    TYPE: p.isIn("ktchi", "btchi", "omni"),
});

if (err) {
    throw FormatPrError(err, "Invalid conf.json5 file.");
}

/**
 * KTCHI | Kamaitachi is the arcade build of Tachi.
 */
const KTCHI_INFO: TachiConfig["TYPE_INFO"] = {
    NAME: "Kamaitachi",
    SUPPORTED_GAMES: ["iidx", "gitadora", "chunithm", "maimai", "museca", "sdvx"],
};

/**
 * BTCHI | Bokutachi is the home-simulator build of Tachi.
 */
const BTCHI_INFO: TachiConfig["TYPE_INFO"] = {
    NAME: "Bokutachi",
    SUPPORTED_GAMES: ["usc", "bms"],
};

/**
 * OMNI | Omnitachi is a local development/testing build of Tachi, which enables all endpoints.
 *
 * If you're one of those nerds who is reading this to figure out how to steal and rerun
 * this codebase this is what you're looking for.
 */
const OMNI_INFO: TachiConfig["TYPE_INFO"] = {
    NAME: "Omnitachi",
    SUPPORTED_GAMES: [...KTCHI_INFO.SUPPORTED_GAMES, ...BTCHI_INFO.SUPPORTED_GAMES],
};

if (config.TYPE === "ktchi") {
    config.TYPE_INFO = KTCHI_INFO;
} else if (config.TYPE === "btchi") {
    config.TYPE_INFO = BTCHI_INFO;
} else if (config.TYPE === "omni") {
    config.TYPE_INFO = OMNI_INFO;
}

const tachiConfig = config as TachiConfig;

export const MONGO_BASE_URL = tachiConfig.MONGO_BASE_URL;
export const LOG_LEVEL = tachiConfig.LOG_LEVEL;
export const SESSION_SECRET = tachiConfig.SESSION_SECRET;
export const CAPTCHA_SECRET_KEY = tachiConfig.CAPTCHA_SECRET_KEY;
export const FLO_API_URL = tachiConfig.FLO_API_URL;
export const EAG_API_URL = tachiConfig.EAG_API_URL;
export const ARC_API_URL = tachiConfig.ARC_API_URL;
export const ARC_AUTH_TOKEN = tachiConfig.ARC_AUTH_TOKEN;
export const KTCDN_ROOT = tachiConfig.CDN_ROOT;
export const CONF_INFO = tachiConfig.TYPE_INFO;
export const PORT = tachiConfig.PORT;
export const CONFIG = tachiConfig;
