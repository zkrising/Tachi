import GenericParseEamIIDXCSV from "../../common/eamusement-iidx-csv/parser";
import type {
	IIDXEamusementCSVContext,
	IIDXEamusementCSVData,
} from "../../common/eamusement-iidx-csv/types";
import type { ParserFunctionReturns } from "../../common/types";
import type { KtLogger } from "lib/logger/logger";

function ParsePLIIIDXCSV(
	fileData: Express.Multer.File,
	body: Record<string, unknown>,
	logger: KtLogger
): ParserFunctionReturns<IIDXEamusementCSVData, IIDXEamusementCSVContext> {
	return GenericParseEamIIDXCSV(fileData, body, "PLI", logger);
}

export default ParsePLIIIDXCSV;
