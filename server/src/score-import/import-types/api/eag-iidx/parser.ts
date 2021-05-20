import { KtLogger } from "../../../../types";
import { ParseKaiIIDX } from "../../common/api-kai/iidx/parser";
import { KaiAuthDocument } from "kamaitachi-common";

export function ParseEagIIDX(authDoc: KaiAuthDocument, logger: KtLogger) {
    return ParseKaiIIDX("EAG", authDoc, logger);
}
