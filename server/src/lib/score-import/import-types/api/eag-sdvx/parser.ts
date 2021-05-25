import { KtLogger } from "../../../../../lib/logger/logger";
import { KaiAuthDocument } from "kamaitachi-common";
import { ParseKaiSDVX } from "../../common/api-kai/sdvx/parser";

export function ParseEagSDVX(authDoc: KaiAuthDocument, logger: KtLogger) {
    return ParseKaiSDVX("EAG", authDoc, logger);
}
