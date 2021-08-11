import { KtLogger } from "lib/logger/logger";
import { ParseKaiIIDX } from "../../common/api-kai/iidx/parser";
import { integer } from "tachi-common";
import { GetKaiAuthGuaranteed } from "utils/queries/auth";

export async function ParseFloIIDX(userID: integer, logger: KtLogger) {
	const authDoc = await GetKaiAuthGuaranteed(userID, "FLO", logger);

	return ParseKaiIIDX("FLO", authDoc, logger);
}
