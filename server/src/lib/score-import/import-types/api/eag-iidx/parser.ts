import { ParseKaiIIDX } from "../../common/api-kai/iidx/parser";
import { GetKaiAuthGuaranteed } from "utils/queries/auth";
import type { KtLogger } from "lib/logger/logger";
import type { integer } from "tachi-common";

export async function ParseEagIIDX(userID: integer, logger: KtLogger) {
	const authDoc = await GetKaiAuthGuaranteed(userID, "EAG", logger);

	return ParseKaiIIDX("EAG", authDoc, logger);
}
