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

import CreateLogCtx from "lib/logger/logger";
import { ImportTypes } from "tachi-common";
import { FormatUserDoc, GetUserWithID } from "utils/user";
import { GetInputParser } from "../framework/common/get-input-parser";
import ScoreImportMain from "../framework/score-importing/score-import-main";
import ScoreImportQueue from "./queue";
import { ScoreImportJob } from "./types";

const workerLogger = CreateLogCtx(`Import Worker`);

// Exit if we're not called with node. Think of this like if __name__ != "__main__" in python.
if (require.main !== module) {
	workerLogger.crit(
		"The Score Import Worker was imported, instead of ran directly with node. This is a fatal error. Exiting."
	);
	process.exit(1);
}

/**
 * When a job is fired, this code will actually process the given data
 * and import it into the codebase.
 */
ScoreImportQueue.process(async <I extends ImportTypes>(job: ScoreImportJob<I>) => {
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

	const InputParser = GetInputParser(job.data);

	logger.debug(`Starting import.`);

	const importDocument = await ScoreImportMain(
		user.id,
		job.data.userIntent,
		job.data.importType,
		InputParser,
		job.data.importID,
		logger
	);

	logger.debug(`Finished import.`);

	return importDocument;
});
