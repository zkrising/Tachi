import { KtLogger } from "../../../../types";
import GenericParseEamIIDXCSV from "../../common/eamusement-iidx-csv/parser";
import {
    IIDXEamusementCSVContext,
    IIDXEamusementCSVData,
} from "../../common/eamusement-iidx-csv/types";
import { ParserFunctionReturnsSync } from "../../common/types";

/**
 * Parses a buffer of EamusementCSV data.
 * @param fileData - The buffer to parse.
 * @param body - The request body that made this file import request. Used to infer playtype.
 */
function ParseEamusementIIDXCSV(
    fileData: Express.Multer.File,
    body: Record<string, unknown>,
    logger: KtLogger
): ParserFunctionReturnsSync<IIDXEamusementCSVData, IIDXEamusementCSVContext> {
    return GenericParseEamIIDXCSV(fileData, body, "e-amusement", logger);
}

export default ParseEamusementIIDXCSV;
