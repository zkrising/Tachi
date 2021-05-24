import { KtLogger } from "../../../../types";
import GenericParseEamIIDXCSV from "../../common/eamusement-iidx-csv/parser";
import {
    IIDXEamusementCSVContext,
    IIDXEamusementCSVData,
} from "../../common/eamusement-iidx-csv/types";
import { ParserFunctionReturnsSync } from "../../common/types";

function ParsePLIIIDXCSV(
    fileData: Express.Multer.File,
    body: Record<string, unknown>,
    logger: KtLogger
): ParserFunctionReturnsSync<IIDXEamusementCSVData, IIDXEamusementCSVContext> {
    return GenericParseEamIIDXCSV(fileData, body, "PLI", logger);
}

export default ParsePLIIIDXCSV;
