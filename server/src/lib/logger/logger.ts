import winston, { format, transports, Logger, LeveledLogMethod } from "winston";
import { EscapeStringRegexp } from "utils/misc";
import SafeJSONStringify from "safe-json-stringify";
import { ServerConfig } from "lib/setup/config";

export type KtLogger = Logger & { severe: LeveledLogMethod };

const level = ServerConfig.LOG_LEVEL;

const IN_TESTING = process.env.NODE_ENV === "test";

const formatExcessProperties = (meta: Record<string, unknown>) => {
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

	return ` ${SafeJSONStringify(meta)}`;
};

const formatExcessPropertiesNoStack = (meta: Record<string, unknown>, omitKeys: string[] = []) => {
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

	return ` ${SafeJSONStringify(realMeta)}`;
};

const tachiPrintf = format.printf(
	({ level, message, context = "tachi-root", timestamp, ...meta }) =>
		`${timestamp} [${
			Array.isArray(context) ? context.join(" | ") : context
		}] ${level}: ${message}${formatExcessProperties(meta)}`
);

const tachiConsolePrintf = format.printf(
	({ level, message, context = "tachi-root", timestamp, hideFromConsole, ...meta }) =>
		`${timestamp} [${
			Array.isArray(context) ? context.join(" | ") : context
		}] ${level}: ${message}${formatExcessPropertiesNoStack(meta, hideFromConsole)}`
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

let tports: (
	| winston.transports.ConsoleTransportInstance
	| winston.transports.FileTransportInstance
)[] = [];

/* istanbul ignore next */
if (IN_TESTING) {
	tports = [
		new transports.Console({
			format: consoleFormatRoute,
		}),
	];
} else {
	tports = [
		new transports.File({
			filename: "logs/tachi-error.log",
			level: "error",
			format: defaultFormatRoute,
		}),
		new transports.File({ filename: "logs/tachi.log", format: defaultFormatRoute }),
		new transports.Console({
			format: consoleFormatRoute,
		}),
	];
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
