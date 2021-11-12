import Queue from "bull";
import { RedisClient } from "external/redis/redis";
import CreateLogCtx from "lib/logger/logger";
import { Environment, TachiConfig } from "lib/setup/config";
import ScoreImportFatalError from "../framework/score-importing/score-import-error";

const ScoreImportQueue = new Queue(`${TachiConfig.NAME} Score Import Queue`, Environment.redisUrl);

export default ScoreImportQueue;

const logger = CreateLogCtx("Score Import Queue");

// Log errors if and when they occur.
ScoreImportQueue.on("failed", (job, err) => {
	if (err instanceof ScoreImportFatalError) {
		logger.info(
			`Job ${job.id} hit ScoreImportFatalError (User Fault) with message: ${err.message}`,
			err
		);
	} else {
		logger.error(`Job ${job.id} failed unexpectedly with message: ${err.message}`, err);
	}
});

ScoreImportQueue.on("completed", (job, result) => {
	logger.debug(`Job ${job.id} finished successfully.`, result);
});

export function CloseScoreImportQueue() {
	return ScoreImportQueue.close();
}
