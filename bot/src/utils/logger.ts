import { createLogger, transports, format, Logger } from "winston";
import { LoggerLayers } from "../config";
const { combine, timestamp, label, printf, align, colorize } = format;

const loggerFormat = printf(({ level, message, label, timestamp }) => {
	return `${timestamp} [${label}] ${level} ${message}`;
});


export const createLayeredLogger = (layer: LoggerLayers): Logger => {
	return createLogger({
		transports: [ new transports.Console() ],
		format: combine(
			label({ label: layer }),
			colorize(),
			timestamp(),
			align(),
			loggerFormat
		)
	});
};
