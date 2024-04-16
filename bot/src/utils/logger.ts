import { Transport as SeqTransport } from "@valuabletouch/winston-seq";
import { ProcessEnv } from "config";
import { CreateLogger } from "mei-logger";
import { transports } from "winston";
import type { LoggerLayers } from "../data/data";
import type { MeiLogger } from "mei-logger";
import type { SeqLogLevel } from "seq-logging";

const tports: Array<any> = [new transports.Console({})];

if (ProcessEnv.seqUrl) {
	// Turns winston log levels into seq format.
	const levelMap: Record<string, SeqLogLevel> = {
		crit: "Fatal",
		severe: "Error",
		error: "Error",
		warn: "Warning",
		info: "Information",

		// Note that Seq interprets these in reverse,
		// however, it's easier to read this code if I just
		// use the same levels, instead of the right ones.
		verbose: "Verbose",
		debug: "Debug",
	};

	tports.push(
		new SeqTransport({
			apiKey: ProcessEnv.seqApiKey,
			serverUrl: ProcessEnv.seqUrl,
			onError: (err) => {
				// eslint-disable-next-line no-console
				console.error(`Failed to send seq message: ${err.message}.`);
			},
			levelMapper(level = "") {
				return levelMap[level] ?? "Information";
			},
		})
	);
}

const logger = CreateLogger(`tachi-bot`, undefined, tports);

export default logger;

export function CreateLayeredLogger(layerName: LoggerLayers) {
	const lg = logger.child({
		context: [layerName],
	});

	lg.defaultMeta = { ...(lg.defaultMeta ?? {}), context: [layerName] };

	return lg as MeiLogger;
}
