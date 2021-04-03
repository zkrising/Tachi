import winston, { format, transports } from "winston";
import fs from "fs";
import path from "path";

const level = process.env.LOG_LEVEL ?? "info";

const IN_PROD = process.env.NODE_ENV === "production";
const IN_TESTING = process.env.NODE_ENV === "test";

const ktblackPrintf = format.printf(
    ({ level, message, context, timestamp, ...meta }) =>
        `${timestamp} [${context ?? "ktblack-root"}] ${level}: ${message}${
            meta.length ? `, ${JSON.stringify(meta)}` : ""
        }`
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
        error: 1, // function call (or related process) has failed unexpectedly
        warn: 2, // function call has hit something it didn't expect, but can recover
        info: 3, // something has happened that is expected, but worth logging
        verbose: 4, // something has happened
        debug: 5, // glorified console.log debugging
    },
    level,
    format: defaultFormatRoute,
    transports: tports,
});

export { logger };

function createLogCtx(context: string) {
    return logger.child({ context });
}

export default createLogCtx;
