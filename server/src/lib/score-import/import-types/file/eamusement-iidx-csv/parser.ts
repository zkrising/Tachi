import { KtLogger } from "../../../../logger/logger";
import GenericParseEamIIDXCSV from "../../common/eamusement-iidx-csv/parser";
import {
	IIDXEamusementCSVContext,
	IIDXEamusementCSVData,
} from "../../common/eamusement-iidx-csv/types";
import { ParserFunctionReturns } from "../../common/types";

function ParseEamusementIIDXCSV(
	fileData: Express.Multer.File,
	body: Record<string, unknown>,
	logger: KtLogger
): ParserFunctionReturns<IIDXEamusementCSVData, IIDXEamusementCSVContext> {
	return GenericParseEamIIDXCSV(fileData, body, "e-amusement", logger);
}

export default ParseEamusementIIDXCSV;
