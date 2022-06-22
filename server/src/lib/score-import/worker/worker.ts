import ScoreImportQueue from "./queue";
import { GetInputParser } from "../framework/common/get-input-parser";
import ScoreImportFatalError from "../framework/score-importing/score-import-error";
import ScoreImportMain from "../framework/score-importing/score-import-main";
import { Worker } from "bullmq";
import { HandleSIGTERMGracefully } from "lib/handlers/sigterm";
import CreateLogCtx from "lib/logger/logger";
import { Environment, ServerConfig } from "lib/setup/config";
import { FormatUserDoc, GetUserWithID } from "utils/user";
import { EventEmitter } from "events";
import type { ScoreImportJob, ScoreImportJobData } from "./types";
import type { ImportTypes } from "tachi-common";

EventEmitter.defaultMaxListeners = 20;

// For scaling performance, running score-importing in a separate worker is preferable
// as that way, other API calls don't get halted by particularly expensive imports on
// all cores. Parallelism can only get us so far in the same process.

// You don't have to run this. If it is being ran, you need to set USE_EXTERNAL_SCORE_IMPORT_WORKER
// in conf.json5. That will ensure all score import jobs are thrown at redis and eventually
// end up here.

// If you don't, score importing will happen on the same thread as your router. That's probably
// fine for lower throughputs, but hey. We're aiming a bit higher.

// Explicitly set this before importing anything!
process.env.IS_SCORE_WORKER_SERVER = "true";

const workerLogger = CreateLogCtx(`Import Worker`);

// Exit if we're not called with node. Think of this like if __name__ != "__main__" in python.
if (require.main !== module) {
	workerLogger.crit(
		"The Score Import Worker was imported, instead of ran directly with node. This is a fatal error. Exiting.",
		() => {
			process.exit(1);
		}
	);
}

/**
 * When a job is fired, this code will actually process the given data
 * and import it into the codebase.
 */
export const worker = new Worker(
	ScoreImportQueue.name,
	async <I extends ImportTypes>(job: ScoreImportJob<I>) => {
		const user = await GetUserWithID(job.data.userID);

		if (!user) {
			workerLogger.severe(
				`Couldn't find user with ID ${job.data.userID}. Yet a score import from them was made? (Job ID ${job.id}).`
			);
			throw new Error(
				`Couldn't find user with ID ${job.data.userID}. Yet a score import from them was made? (Job ID ${job.id}).`
			);
		}

		// Create a logger that we can pass around for context.
		// This helps us debug what score import did what!
		const logger = CreateLogCtx(`Score Import ${job.id} ${FormatUserDoc(user)}`);

		// Here's a hack. You cant pass buffers to bull workers, as content
		// **must** be JSON serialisable. As such, all of our buffers get
		// turned into nonsense objects. We need to "deJSONify" these buffers
		// so lets do that now.

		const processedArgs: Array<any> = [];

		// eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call

		for (const arg of job.data.parserArguments as Array<any>) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			if (arg?.buffer?.type === "Buffer") {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
				processedArgs.push({ ...arg, buffer: Buffer.from(arg.buffer.data) });
			} else {
				processedArgs.push(arg);
			}
		}

		job.data.parserArguments = processedArgs as ScoreImportJobData<I>["parserArguments"];

		logger.debug(`received score import job ${job.id}`, { job });

		const InputParser = GetInputParser(job.data);

		logger.debug(`Starting import.`);

		void job.updateProgress({
			description: "Importing Scores.",
		});

		try {
			const importDocument = await ScoreImportMain(
				user.id,
				job.data.userIntent,
				job.data.importType,
				InputParser,
				job.data.importID,
				logger,
				job
			);

			logger.debug(`Finished import.`);

			return { success: true, importDocument };
		} catch (err) {
			if (err instanceof ScoreImportFatalError) {
				logger.info(
					`Job ${job.id} hit ScoreImportFatalError (User Fault) with message: ${err.message}`,
					err
				);
				return { success: false, statusCode: err.statusCode, description: err.message };
			}

			throw err;
		}
	},
	{
		concurrency: ServerConfig.EXTERNAL_SCORE_IMPORT_WORKER_CONCURRENCY ?? 10,
		connection: {
			port: 6379,
			host: Environment.redisUrl,
		},
	}
);

const logger = CreateLogCtx("Score Import Worker");

worker.on("failed", (job, err) => {
	if (err instanceof ScoreImportFatalError) {
		logger.info(
			`Job ${job.id} hit ScoreImportFatalError (User Fault) with message: ${err.message}`,
			err
		);
	} else {
		logger.error(`Job ${job.id} failed unexpectedly with message: ${err.message}`, err);
	}
});

worker.on("completed", (job, result) => {
	logger.debug(`Job ${job.id} finished successfully.`, result);
});

process.on("SIGTERM", () => {
	void HandleSIGTERMGracefully();
});
