import { CreateLogger, MeiLogger } from "mei-logger";
import { LoggerLayers } from "../data/data";

const logger = CreateLogger(`tachi-bot`);

export default logger;

export function createLayeredLogger(layerName: LoggerLayers) {
	const lg = logger.child({
		context: [layerName],
	});

	lg.defaultMeta = Object.assign({}, lg.defaultMeta ?? {}, {
		context: [layerName],
	});

	return lg as MeiLogger;
}
