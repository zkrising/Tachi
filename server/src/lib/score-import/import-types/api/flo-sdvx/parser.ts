import { KtLogger } from "lib/logger/logger";
import { integer } from "tachi-common";
import { GetKaiAuthGuaranteed } from "utils/queries/auth";
import { ParseKaiSDVX } from "../../common/api-kai/sdvx/parser";

export async function ParseFloSDVX(userID: integer, logger: KtLogger) {
	const authDoc = await GetKaiAuthGuaranteed(userID, "FLO", logger);

	return ParseKaiSDVX("FLO", authDoc, logger);
}
