import { CreateLogger } from "mei-logger";
import type { LoggerLayers } from "../data/data";
import type { MeiLogger } from "mei-logger";

const logger = CreateLogger(`tachi-bot`);

export default logger;

export function CreateLayeredLogger(layerName: LoggerLayers) {
	const lg = logger.child({
		context: [layerName],
	});

	lg.defaultMeta = { ...(lg.defaultMeta ?? {}), context: [layerName] };

	return lg as MeiLogger;
}
