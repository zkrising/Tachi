import winston, { format, Logger, transports } from "winston";
import fs from "fs";
import path from "path";
import { ImportTypes, PublicUserDocument } from "kamaitachi-common";
import { FormatUserDoc } from "./core/format-user";

const level = process.env.LOG_LEVEL ?? "info";

// const IN_PROD = process.env.NODE_ENV === "production";
const IN_TESTING = process.env.NODE_ENV === "test";

const ktblackPrintf = format.printf(
    ({ level, message, context = "ktblack-root", timestamp, ...meta }) =>
        `${timestamp} [${
            Array.isArray(context) ? context.join(" | ") : context
        }] ${level}: ${message}${meta.length ? `, ${JSON.stringify(meta)}` : ""}`
);

const defaultFormatRoute = format.combine(
    format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.errors({ stack: true }),
    ktblackPrintf
);

let tports = [];

if (IN_TESTING) {
    // empty the logs!
    fs.rmSync(path.join(__dirname, "../logs/ktblack-tests-error.log"));
    fs.rmSync(path.join(__dirname, "../logs/ktblack-tests.log"));

    tports = [
        new transports.File({
            filename: "logs/ktblack-tests-error.log",
            level: "error",
        }),
        new transports.File({ filename: "logs/ktblack-tests.log" }),
        new transports.Console({
            format: format.combine(format.colorize({ level: true }), defaultFormatRoute),
        }),
    ];
} else {
    tports = [
        new transports.File({
            filename: "logs/ktblack-error.log",
            level: "error",
        }),
        new transports.File({ filename: "logs/ktblack.log" }),
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

function CreateLogCtx(context: string, lg = logger) {
    return lg.child({ context });
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
