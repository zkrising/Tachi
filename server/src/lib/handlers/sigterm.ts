import { monkDB } from "external/mongo/db";
import { CloseRedisConnection } from "external/redis/redis";
import http from "http";
import https from "https";
import { rootLogger } from "lib/logger/logger";
import { CloseScoreImportQueue } from "lib/score-import/worker/queue";

const logger = rootLogger;

export function HandleSIGTERMGracefully(instance?: http.Server | https.Server) {
	logger.info("SIGTERM Received, closing program.", { shutdownInfo: true });

	if (instance) {
		instance.close(() => {
			CloseEverythingElse();
		});
	} else {
		CloseEverythingElse();
	}
}

async function CloseEverythingElse() {
	logger.info("Closing Mongo Database.", { shutdownInfo: true });
	await monkDB.close();

	logger.info("Closing Redis Connection.", { shutdownInfo: true });
	CloseRedisConnection();

	logger.info("Closing Score Import Queue.", { shutdownInfo: true });
	CloseScoreImportQueue();

	logger.info("Everything closed. Waiting for process to exit naturally.", {
		shutdownInfo: true,
	});
}
