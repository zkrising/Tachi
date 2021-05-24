import { KtLogger } from "../../../../types";
import { ParseBatchManualFromObject } from "../../common/batch-manual/parser";
import { BatchManualContext, BatchManualScore } from "../../common/batch-manual/types";
import { ParserFunctionReturnsSync } from "../../common/types";

/**
 * Parses an object of BATCH-MANUAL data.
 * @param fileData - The buffer to parse.
 * @param body - The request body that made this file import request.
 */
function ParseDirectManual(
    body: Record<string, unknown>,
    logger: KtLogger
): ParserFunctionReturnsSync<BatchManualScore, BatchManualContext> {
    return ParseBatchManualFromObject(body, "ir/direct-manual", logger);
}

export default ParseDirectManual;
