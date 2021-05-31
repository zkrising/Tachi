import winston, { format, transports, Logger, LeveledLogMethod } from "winston";

export type KtLogger = Logger & { severe: LeveledLogMethod };

const level = process.env.LOG_LEVEL ?? "info";

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

    return ` ${JSON.stringify(meta)}`;
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

    return ` ${JSON.stringify(realMeta)}`;
};

const ktblackPrintf = format.printf(
    ({ level, message, context = "ktblack-root", timestamp, ...meta }) =>
        `${timestamp} [${
            Array.isArray(context) ? context.join(" | ") : context
        }] ${level}: ${message}${formatExcessProperties(meta)}`
);

const ktblackConsolePrintf = format.printf(
    ({ level, message, context = "ktblack-root", timestamp, hideFromConsole, ...meta }) =>
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
    ktblackPrintf
);

const consoleFormatRoute = format.combine(
    baseFormatRoute,
    format.errors({ stack: false }),
    ktblackConsolePrintf,
    format.colorize({
        all: true,
    })
);

let tports = [];

if (IN_TESTING) {
    tports = [
        new transports.File({
            filename: "logs/ktblack-tests-error.log",
            level: "error",
            format: defaultFormatRoute,
        }),
        new transports.File({ filename: "logs/ktblack-tests.log", format: defaultFormatRoute }),
        new transports.Console({
            format: consoleFormatRoute,
        }),
    ];
} else {
    tports = [
        new transports.File({
            filename: "logs/ktblack-error.log",
            level: "error",
            format: defaultFormatRoute,
        }),
        new transports.File({ filename: "logs/ktblack.log", format: defaultFormatRoute }),
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
    const logger = lg.child({
        context: filename.replace(new RegExp(`^${process.cwd()}/`, "u"), ""),
    }) as KtLogger;

    logger.defaultMeta = { context: [filename] };
    return logger;
}

export function AppendLogCtx(context: string, lg: KtLogger): KtLogger {
    const newContext = [...lg.defaultMeta.context, context];

    return lg.child({ context: newContext }) as KtLogger;
}

export const Transports = tports;

export default CreateLogCtx;
