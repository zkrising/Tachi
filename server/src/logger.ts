import winston, { format, LeveledLogMethod, Logger, transports } from "winston";
import { ImportTypes, PublicUserDocument } from "kamaitachi-common";
import { FormatUserDoc } from "./core/format-user";
import { serializeError as serialiseError } from "serialize-error";

// @ts-expect-error I don't normally monkey patch, but when I do...
Error.prototype.toJSON = serialiseError;

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

const ktblackPrintf = format.printf(
    ({ level, message, context = "ktblack-root", timestamp, ...meta }) =>
        `${timestamp} [${
            Array.isArray(context) ? context.join(" | ") : context
        }] ${level}: ${message}${formatExcessProperties(meta)}`
);

const defaultFormatRoute = format.combine(
    format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.errors({ stack: true }),
    ktblackPrintf
);

const jsonFormatRoute = format.combine(
    format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.errors({ stack: true }),
    format.json()
);

let tports = [];

if (IN_TESTING) {
    tports = [
        new transports.File({
            filename: "logs/ktblack-tests-error.log",
            level: "error",
            format: jsonFormatRoute,
        }),
        new transports.File({ filename: "logs/ktblack-tests.log", format: jsonFormatRoute }),
        new transports.Console({
            format: format.combine(format.colorize({ level: true }), defaultFormatRoute),
        }),
    ];
} else {
    tports = [
        new transports.File({
            filename: "logs/ktblack-error.log",
            level: "error",
            format: jsonFormatRoute,
        }),
        new transports.File({ filename: "logs/ktblack.log", format: jsonFormatRoute }),
        new transports.Console({
            format: format.combine(format.colorize({ level: true }), defaultFormatRoute),
        }),
    ];
}

const logger = winston.createLogger({
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

function CreateLogCtx(context: string, lg = logger): Logger & { severe: LeveledLogMethod } {
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
    return logger.child({ context: ["Score Import", importType, FormatUserDoc(user)], importID });
}

export default CreateLogCtx;
