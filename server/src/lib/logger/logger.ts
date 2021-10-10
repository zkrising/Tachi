import winston, { format, transports, Logger, LeveledLogMethod } from "winston";
import { EscapeStringRegexp } from "utils/misc";
import SafeJSONStringify from "safe-json-stringify";
import { ServerConfig } from "lib/setup/config";
import CreateDiscordWinstonTransport from "./discord-transport";

export type KtLogger = Logger & { severe: LeveledLogMethod };

const level = process.env.LOG_LEVEL ?? ServerConfig.LOG_LEVEL;

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

const tachiPrintf = format.printf(
	({ level, message, context = "tachi-root", timestamp, ...meta }) =>
		`${timestamp} [${
			Array.isArray(context) ? context.join(" | ") : context
		}] ${level}: ${message}${formatExcessProperties(meta, true)}`
);

const tachiConsolePrintf = format.printf(
	({ level, message, context = "tachi-root", timestamp, hideFromConsole, ...meta }) =>
		`${timestamp} [${
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

const tports: winston.transport[] = [
	new transports.File({
		filename: "logs/tachi-error.log",
		level: "error",
		format: defaultFormatRoute,
	}),
	new transports.File({ filename: "logs/tachi.log", format: defaultFormatRoute }),
];

if (!ServerConfig.NO_CONSOLE) {
	tports.push(
		new transports.Console({
			format: consoleFormatRoute,
		})
	);
}

if (ServerConfig.LOGGER_DISCORD_WEBHOOK) {
	tports.push(
		new CreateDiscordWinstonTransport({
			webhook: ServerConfig.LOGGER_DISCORD_WEBHOOK,
			level: "warn",
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
});

if (ServerConfig.LOGGER_DISCORD_WEBHOOK) {
	rootLogger.info(`Discord logging enabled.`);
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
