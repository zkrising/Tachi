import db from "external/mongo/db";
import { CDNStoreOrOverwrite } from "lib/cdn/cdn";
import { GetScoreImportInputURL } from "lib/cdn/url-format";
import CreateLogCtx from "lib/logger/logger";
import type ScoreImportFatalError from "../score-importing/score-import-error";
import type { ScoreImportJobData } from "lib/score-import/worker/types";
import type { ImportTypes } from "tachi-common";

const logger = CreateLogCtx(__filename);

/**
 * For us to save the incoming parserArguments,
 * we want to pretty it up a bit into something
 * actually legible for debugging reasons.
 *
 * As is typical for Tachi, we go for JSON. It's good.
 *
 * @note - Some things in our parserArguments might contain buffers.
 * Buffers are - by definition - stringified using `.toJSON`, which causes them to become
 * { type: "Buffer", data: [array_of_integers] }. This is frustrating to read, especially
 * while debugging, as now we need a viewer to understand the file that was provided.
 *
 * However, we have a viewer for this data anyway, so people are just going to have to
 * live with that inconvenience. It's not worth the hassle of - say - trying to turn
 * that buffer into UTF-8 when in the future we might accept binary-esque files as imports,
 * like SQLite dbs, or something.
 */
function SerialiseJobData(jobData: ScoreImportJobData<ImportTypes>): string {
	return JSON.stringify(jobData.parserArguments);
}

/**
 * Start tracking a score import by marking it as tracked in the database.
 *
 * @note - Awaiting this function is notable, as it will only await until the data is
 * inserted in the database. The part where it uploads the content to S3 is not actually
 * awaited when you await this function, it happens in the background.
 */
export async function StartTrackingImport(jobData: ScoreImportJobData<ImportTypes>) {
	await db["import-trackers"].insert({
		type: "ONGOING",
		importID: jobData.importID,
		importType: jobData.importType,
		userID: jobData.userID,
		userIntent: jobData.userIntent,
		timeStarted: Date.now(),
	});

	// store the input for this import on the CDN. The CDN is likely the right place
	// to store large amounts of write-only data, so lets do that.
	CDNStoreOrOverwrite(GetScoreImportInputURL(jobData.importID), SerialiseJobData(jobData)).catch(
		() => {
			logger.error(
				`Failed to save score-import-input for import '${
					jobData.importID
				}' at path '${GetScoreImportInputURL(jobData.importID)}'.`
			);
		}
	);
}

export async function MarkImportAsFailed(importID: string, error: Error | ScoreImportFatalError) {
	await db["import-trackers"].update(
		{
			importID,
		},
		{
			$set: {
				type: "FAILED",
				error: {
					statusCode: "statusCode" in error ? error.statusCode : undefined,
					message: error.message,
				},
			},
		}
	);
}

/**
 * Successful imports don't need to be tracked. Only failed imports are kept around
 * in the tracker.
 */
export async function EndTrackingImport(importID: string) {
	await db["import-trackers"].remove({ importID });
}
