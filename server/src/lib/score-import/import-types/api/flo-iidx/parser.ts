import { ParseKaiIIDX } from "../../common/api-kai/iidx/parser";
import { GetKaiAuthGuaranteed } from "utils/queries/auth";
import type { KtLogger } from "lib/logger/logger";
import type { integer } from "tachi-common";

export async function ParseFloIIDX(userID: integer, logger: KtLogger) {
	const authDoc = await GetKaiAuthGuaranteed(userID, "FLO", logger);

	return ParseKaiIIDX("FLO", authDoc, logger);
}
