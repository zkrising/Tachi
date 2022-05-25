import ScoreImportFatalError from "../../../framework/score-importing/score-import-error";
import { ParseBatchManualFromObject } from "../../common/batch-manual/parser";
import type { BatchManualContext } from "../../common/batch-manual/types";
import type { ParserFunctionReturns } from "../../common/types";
import type { KtLogger } from "lib/logger/logger";
import type { BatchManualScore } from "tachi-common";

/**
 * Parses a buffer of BATCH-MANUAL data.
 * @param fileData - The buffer to parse.
 * @param body - The request body that made this file import request.
 */
function ParseBatchManual(
	fileData: Express.Multer.File,
	body: Record<string, unknown>,
	logger: KtLogger
): ParserFunctionReturns<BatchManualScore, BatchManualContext> {
	let jsonData: unknown;

	try {
		jsonData = JSON.parse(fileData.buffer.toString("utf-8"));
	} catch (err) {
		throw new ScoreImportFatalError(400, `Invalid JSON. (${(err as Error).message})`);
	}

	return ParseBatchManualFromObject(jsonData, "file/batch-manual", logger);
}

export default ParseBatchManual;
