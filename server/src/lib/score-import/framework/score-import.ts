/* eslint-disable no-await-in-loop */
import { GetInputParser } from "./common/get-input-parser";
import ScoreImportFatalError from "./score-importing/score-import-error";
import ScoreImportMain from "./score-importing/score-import-main";
import {
	EndTrackingImport,
	MarkImportAsFailed,
	StartTrackingImport,
} from "./status-tracking/import-status-tracking";
import ScoreImportQueue, { ScoreImportQueueEvents } from "../worker/queue";
import { JOB_RETRY_COUNT } from "lib/constants/tachi";
import CreateLogCtx from "lib/logger/logger";
import { ServerConfig } from "lib/setup/config";
import { Sleep } from "utils/misc";
import type { ScoreImportJobData, ScoreImportWorkerReturns } from "../worker/types";
import type { ImportDocument, ImportTypes, integer } from "tachi-common";

const logger = CreateLogCtx(__filename);

/**
 * Makes a score import given ScoreImportJobData.
 * If USE_EXTERNAL_SCORE_IMPORT_WORKER is set, then this will instead
 * place this on the score import queue, and the worker will process it.
 *
 * Otherwise, it will just perform score importing on the same process.
 * @returns An import document if awaited, however, you should not
 * await this if you don't need the import document! Import Documents
 * may take multiple minutes to generate for large imports. If you control
 * the client, make it poll /api/v1/ongoing-imports/:importID.
 */
export async function MakeScoreImport<I extends ImportTypes>(
	jobData: ScoreImportJobData<I>
): Promise<ImportDocument> {
	await StartTrackingImport(jobData);

	try {
		const importDocument = await MakeScoreImportInner(jobData);

		await EndTrackingImport(jobData.importID);

		return importDocument;
	} catch (e) {
		const err = e as Error | ScoreImportFatalError;

		await MarkImportAsFailed(jobData.importID, err);

		throw err;
	}
}

/**
 * Inner function that actually makes the score import. This is intended to be wrapped
 * by the import-tracking code, as it's useful for errors.
 */
async function MakeScoreImportInner<I extends ImportTypes>(
	jobData: ScoreImportJobData<I>
): Promise<ImportDocument> {
	if (ServerConfig.USE_EXTERNAL_SCORE_IMPORT_WORKER && process.env.IS_JOB === undefined) {
		let timesAttempted = 1;

		// There's no chance this thing goes on 7 times.
		// if it does, this import has been trying for the past 6 hours or so.
		while (timesAttempted <= JOB_RETRY_COUNT) {
			const job = await ScoreImportQueue.add(
				`Import ${jobData.importID}${timesAttempted > 0 ? ` (TRY${timesAttempted})` : ""}`,
				jobData,
				{
					jobId: `${jobData.importID}:TRY${timesAttempted}`,
				}
			);

			const data = (await job.waitUntilFinished(
				ScoreImportQueueEvents
			)) as ScoreImportWorkerReturns;

			if (data.success) {
				await EndTrackingImport(jobData.importID);
				return data.importDocument;
			} else if (data.statusCode !== 409) {
				throw new ScoreImportFatalError(data.statusCode, data.description);
			}

			const backoff = ExponentialBackoff(timesAttempted - 1);

			logger.info(
				`User ${jobData.userID} already had an import ongoing. (${
					jobData.importID
				}) Backing off for ${(backoff / 1_000).toFixed(2)} seconds.`
			);

			// If we get here, we were 409'd and the user already has an ongoing
			// import.
			// In the interest of not just throwing scores away, we'll back off a bit
			// and then restart the job.
			await Sleep(backoff);

			timesAttempted++;
		}

		logger.error(
			`User ${jobData.userID} didn't get an import through in around 6 hours. Has their lock gotten stuck?`,
			jobData
		);

		throw new ScoreImportFatalError(
			409,
			"Couldn't get an import through in the past 6 hours, at all."
		);
	} else {
		const InputParser = GetInputParser(jobData);

		return ScoreImportMain(
			jobData.userID,
			jobData.userIntent,
			jobData.importType,
			InputParser,
			jobData.importID
		);
	}
}

function ExponentialBackoff(exponent: integer) {
	// n | backoff
	// 0 | 4 Seconds
	// 1 | 16 Seconds
	// 2 | 64 Seconds
	// 3 | 256 Seconds
	// 4 | 1024 Seconds
	// ...
	// ends at 7, which is around 4 hours.

	return 1000 * 4 ** (exponent + 1);
}
