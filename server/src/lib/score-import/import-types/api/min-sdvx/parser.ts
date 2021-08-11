import { KtLogger } from "lib/logger/logger";
import { integer } from "tachi-common";
import { GetKaiAuthGuaranteed } from "utils/queries/auth";
import { ParseKaiSDVX } from "../../common/api-kai/sdvx/parser";

export async function ParseMinSDVX(userID: integer, logger: KtLogger) {
	const authDoc = await GetKaiAuthGuaranteed(userID, "MIN", logger);

	return ParseKaiSDVX("MIN", authDoc, logger);
}
