import { CreateLogger } from "mei-logger";
import { transports } from "winston";
import type { LoggerLayers } from "../data/data";
import type { MeiLogger } from "mei-logger";

const tports: Array<any> = [new transports.Console({})];

const logger = CreateLogger(`tachi-bot`, undefined, tports);

export default logger;

export function CreateLayeredLogger(layerName: LoggerLayers) {
	const lg = logger.child({
		context: [layerName],
	});

	lg.defaultMeta = { ...(lg.defaultMeta ?? {}), context: [layerName] };

	return lg as MeiLogger;
}
