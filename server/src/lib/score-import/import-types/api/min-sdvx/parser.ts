import { KtLogger } from "lib/logger/logger";
import { KaiAuthDocument } from "tachi-common";
import { ParseKaiSDVX } from "../../common/api-kai/sdvx/parser";

export function ParseMinSDVX(authDoc: KaiAuthDocument, logger: KtLogger) {
	return ParseKaiSDVX("MIN", authDoc, logger);
}
