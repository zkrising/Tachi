import winston, { format, transports } from "winston";

const level = process.env.LOG_LEVEL ?? "info";

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
    transports: [
        new transports.File({
            filename: "logs/ktblack-error.log",
            level: "error",
        }),
        new transports.File({ filename: "logs/ktblack.log" }),
        new transports.Console({
            format: format.combine(format.colorize({ level: true }), defaultFormatRoute),
        }),
    ],
});

export { logger };

function createLogCtx(context: string) {
    return logger.child({ context });
}

export default createLogCtx;
