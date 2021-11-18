import { ServerConfig } from "lib/setup/config";
import { ScoreImportJobData } from "../worker/types";
import { GetInputParser } from "./common/get-input-parser";
import ScoreImportMain from "./score-importing/score-import-main";
import { ImportTypes, ImportDocument } from "tachi-common";
import ScoreImportQueue from "../worker/queue";
import ScoreImportFatalError from "./score-importing/score-import-error";

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
	if (ServerConfig.USE_EXTERNAL_SCORE_IMPORT_WORKER && process.env.IS_JOB === undefined) {
		const job = await ScoreImportQueue.add(jobData, {
			jobId: jobData.importID,
		});

		const data = await job.finished();

		if (data.success) {
			return data.importDocument;
		} else {
			throw new ScoreImportFatalError(data.statusCode, data.description);
		}
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
