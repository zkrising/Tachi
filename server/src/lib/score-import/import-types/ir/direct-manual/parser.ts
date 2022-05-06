import { ParseBatchManualFromObject } from "../../common/batch-manual/parser";
import type { BatchManualContext } from "../../common/batch-manual/types";
import type { ParserFunctionReturns } from "../../common/types";
import type { KtLogger } from "lib/logger/logger";
import type { BatchManualScore } from "tachi-common";

/**
 * Parses an object of BATCH-MANUAL data.
 * @param fileData - The buffer to parse.
 * @param body - The request body that made this file import request.
 */
function ParseDirectManual(
	body: Record<string, unknown>,
	logger: KtLogger
): ParserFunctionReturns<BatchManualScore, BatchManualContext> {
	return ParseBatchManualFromObject(body, "ir/direct-manual", logger);
}

export default ParseDirectManual;
