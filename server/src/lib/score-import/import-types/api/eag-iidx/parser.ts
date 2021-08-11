import { KtLogger } from "lib/logger/logger";
import { ParseKaiIIDX } from "../../common/api-kai/iidx/parser";
import { integer } from "tachi-common";
import { GetKaiAuthGuaranteed } from "utils/queries/auth";

export async function ParseEagIIDX(userID: integer, logger: KtLogger) {
	const authDoc = await GetKaiAuthGuaranteed(userID, "EAG", logger);

	return ParseKaiIIDX("EAG", authDoc, logger);
}
