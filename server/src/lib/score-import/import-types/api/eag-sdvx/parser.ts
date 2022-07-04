import { ParseKaiSDVX } from "../../common/api-kai/sdvx/parser";
import { GetKaiAuthGuaranteed } from "utils/queries/auth";
import type { KtLogger } from "lib/logger/logger";
import type { integer } from "tachi-common";

export async function ParseEagSDVX(userID: integer, logger: KtLogger) {
	const authDoc = await GetKaiAuthGuaranteed(userID, "EAG", logger);

	return ParseKaiSDVX("EAG", authDoc, logger);
}
