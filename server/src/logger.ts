import winston, { format, LeveledLogMethod, Logger, transports } from "winston";
import { ImportTypes, PublicUserDocument } from "kamaitachi-common";
import { FormatUserDoc } from "./core/format-user";

const level = process.env.LOG_LEVEL ?? "info";

// const IN_PROD = process.env.NODE_ENV === "production";
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

const formatExcessPropertiesNoStack = (meta: Record<string, unknown>) => {
    let i = 0;
    for (const key in meta) {
        const val = meta[key];

        if (val instanceof Error) {
            meta[key] = { message: val.message };
        }
        i++;
    }

    if (!i) {
        return "";
    }

    return ` ${JSON.stringify(meta)}`;
};

const ktblackPrintf = format.printf(
    ({ level, message, context = "ktblack-root", timestamp, ...meta }) =>
        `${timestamp} [${
            Array.isArray(context) ? context.join(" | ") : context
        }] ${level}: ${message}${formatExcessProperties(meta)}`
);

const ktblackConsolePrintf = format.printf(
    ({ level, message, context = "ktblack-root", timestamp, ...meta }) =>
        `${timestamp} [${
            Array.isArray(context) ? context.join(" | ") : context
        }] ${level}: ${message}${formatExcessPropertiesNoStack(meta)}`
);

winston.addColors({
    crit: ["bgRed", "black"],
    severe: ["bgWhite", "red"],
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
    defaultFormatRoute,
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

function CreateLogCtx(context: string, lg = rootLogger): Logger & { severe: LeveledLogMethod } {
    return lg.child({ context }) as Logger & { severe: LeveledLogMethod };
}

export function AppendLogCtx(context: string, lg: Logger) {
    let newContext = [...lg.defaultMeta.context, context];

    return lg.child({ context: newContext });
}

export function CreateScoreLogger(
    user: PublicUserDocument,
    importID: string,
    importType: ImportTypes
) {
    return rootLogger.child({
        context: ["Score Import", importType, FormatUserDoc(user)],
        importID,
    });
}

export const Transports = tports;

export default CreateLogCtx;
