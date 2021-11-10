import { Transport as SeqTransport } from "@valuabletouch/winston-seq";
import { Environment, ServerConfig, TachiConfig } from "lib/setup/config";
import SafeJSONStringify from "safe-json-stringify";
import { SeqLogLevel } from "seq-logging";
import { EscapeStringRegexp } from "utils/misc";
import winston, { format, LeveledLogMethod, Logger, transports } from "winston";
import "winston-daily-rotate-file";
import DiscordWinstonTransport from "./discord-transport";

export type KtLogger = Logger & { severe: LeveledLogMethod };

const level = process.env.LOG_LEVEL ?? ServerConfig.LOGGER_CONFIG.LOG_LEVEL;

const formatExcessProperties = (meta: Record<string, unknown>, limit = false) => {
	let i = 0;
	for (const key in meta) {
		const val = meta[key];

		if (val instanceof Error) {
			meta[key] = { message: val.message, stack: val.stack };
		}
		i++;
	}

	if (!i) {
		return "";
	}

	const content = SafeJSONStringify(meta);

	return ` ${limit ? StrCap(content) : content}`;
};

function StrCap(string: string) {
	if (string.length > 300) {
		return `${string.slice(0, 297)}...`;
	}

	return string;
}

const formatExcessPropertiesNoStack = (
	meta: Record<string, unknown>,
	omitKeys: string[] = [],
	limit = false
) => {
	let i = 0;
	const realMeta: Record<string, unknown> = {};

	for (const key in meta) {
		if (omitKeys.includes(key)) {
			continue;
		}

		const val = meta[key];

		if (val instanceof Error) {
			realMeta[key] = { message: val.message };
		} else {
			realMeta[key] = val;
		}
		i++;
	}

	if (!i) {
		return "";
	}

	const content = SafeJSONStringify(realMeta);

	return ` ${limit ? StrCap(content) : content}`;
};

const replicaInfo = Environment.replicaIdentity ? ` (${Environment.replicaIdentity})` : "";

const tachiPrintf = format.printf(
	({ level, message, context = "tachi-root", timestamp, ...meta }) =>
		`${timestamp}${replicaInfo} [${
			Array.isArray(context) ? context.join(" | ") : context
		}] ${level}: ${message}${formatExcessProperties(meta, true)}`
);

const tachiConsolePrintf = format.printf(
	({ level, message, context = "tachi-root", timestamp, hideFromConsole, ...meta }) =>
		`${timestamp}${replicaInfo} [${
			Array.isArray(context) ? context.join(" | ") : context
		}] ${level}: ${message}${formatExcessPropertiesNoStack(meta, hideFromConsole, true)}`
);

winston.addColors({
	crit: ["bgRed", "black"],
	severe: ["bgBrightRed", "black"],
	error: ["red"],
	warn: ["yellow"],
	info: ["blue"],
	verbose: ["cyan"],
	debug: ["white"],
});

const baseFormatRoute = format.combine(
	format.timestamp({
		format: "YYYY-MM-DD HH:mm:ss",
	})
);

const defaultFormatRoute = format.combine(
	baseFormatRoute,
	format.errors({ stack: false }),
	tachiPrintf
);

const consoleFormatRoute = format.combine(
	baseFormatRoute,
	format.errors({ stack: false }),
	tachiConsolePrintf,
	format.colorize({
		all: true,
	})
);

const tports: winston.transport[] = [];

if (ServerConfig.LOGGER_CONFIG.FILE) {
	tports.push(
		new transports.DailyRotateFile({
			filename: "logs/tachi-%DATE%.log",
			datePattern: "YYYY-MM-DD-HH",
			zippedArchive: true,
			maxSize: "20m",
			maxFiles: "14d",
			createSymlink: true,
			symlinkName: "tachi.log",
			format: defaultFormatRoute,
		})
	);
}

if (ServerConfig.LOGGER_CONFIG.CONSOLE) {
	tports.push(
		new transports.Console({
			format: consoleFormatRoute,
		})
	);
}

if (ServerConfig.LOGGER_CONFIG.DISCORD) {
	tports.push(
		new DiscordWinstonTransport({
			webhook: ServerConfig.LOGGER_CONFIG.DISCORD.WEBHOOK_URL,
			level: "warn",
		})
	);
}

if (ServerConfig.LOGGER_CONFIG.SEQ_API_KEY && Environment.seqUrl) {
	// Turns winston log levels into seq format.
	const levelMap: Record<string, SeqLogLevel> = {
		crit: "Fatal",
		severe: "Error",
		error: "Error",
		warn: "Warning",
		info: "Information",
		// Note that Seq interprets these in reverse,
		// however, it's easier to read this code if I just
		// use the same levels, instead of the right onesQ.
		verbose: "Verbose",
		debug: "Debug",
	};

	tports.push(
		new SeqTransport({
			apiKey: ServerConfig.LOGGER_CONFIG.SEQ_API_KEY,
			serverUrl: Environment.seqUrl,
			levelMapper(level = "") {
				return levelMap[level] ?? "information";
			},
		})
	);
}

export const rootLogger = winston.createLogger({
	levels: {
		crit: 0, // entire process termination is necessary
		severe: 1, // something is wrong, and more than one function is affected (such as a failed assertion that is definitely expected to be true).
		error: 2, // function call (or related process) has failed unexpectedly
		warn: 3, // function call has hit something it didn't want, but can recover
		info: 4, // something has happened that is expected, but worth logging
		verbose: 5, // something has happened
		debug: 6, // glorified console.log debugging
	},
	level,
	format: defaultFormatRoute,
	transports: tports,
	defaultMeta: {
		__ServerName: TachiConfig.NAME,
		__ReplicaID: Environment.replicaIdentity,
	},
});

if (!!ServerConfig.LOGGER_CONFIG.SEQ_API_KEY !== !!Environment.seqUrl) {
	rootLogger.warn(
		`Only one of SEQ_API_KEY (conf.json5) and SEQ_URL (Environment) were set. Not sending logs to Seq, as both must be provided.`
	);
}

if (tports.length === 0) {
	// eslint-disable-next-line no-console
	console.warn(
		"You have no transports set. Absolutely no logs will be saved. This is a terrible idea!"
	);
}

function CreateLogCtx(filename: string, lg = rootLogger): KtLogger {
	const replacedFilename = filename.replace(
		new RegExp(`^${EscapeStringRegexp(process.cwd())}/((js|src)/)?`, "u"),
		""
	);

	const logger = lg.child({
		context: [replacedFilename],
	}) as KtLogger;

	logger.defaultMeta = { context: [replacedFilename] };
	return logger;
}

export function AppendLogCtx(context: string, lg: KtLogger): KtLogger {
	const newContext = [...lg.defaultMeta.context, context];

	return lg.child({ context: newContext }) as KtLogger;
}

export function ChangeRootLogLevel(
	level: "crit" | "severe" | "error" | "warn" | "info" | "verbose" | "debug"
) {
	rootLogger.info(`Changing log level to ${level}.`);

	for (const tp of tports) {
		tp.level = level;
	}
}

export function GetLogLevel() {
	return tports[0].level;
}

export const Transports = tports;

export default CreateLogCtx;
