import { ParseKaiSDVX } from "../../common/api-kai/sdvx/parser";
import { GetKaiAuthGuaranteed } from "utils/queries/auth";
import type { KtLogger } from "lib/logger/logger";
import type { integer } from "tachi-common";

export async function ParseMinSDVX(userID: integer, logger: KtLogger) {
	const authDoc = await GetKaiAuthGuaranteed(userID, "MIN", logger);

	return ParseKaiSDVX("MIN", authDoc, logger);
}
