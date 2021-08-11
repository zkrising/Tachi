import { KtLogger } from "lib/logger/logger";
import nodeFetch from "utils/fetch";
import { TraverseKaiAPI } from "../../common/api-kai/traverse-api";
import { ParserFunctionReturns } from "../../common/types";
import { EmptyObject } from "utils/types";
import { ServerConfig } from "lib/setup/config";
import { integer } from "tachi-common";
import { GetArcAuthGuaranteed } from "utils/queries/auth";

export async function ParseArcDDR(
	userID: integer,
	logger: KtLogger,
	fetch = nodeFetch
): Promise<ParserFunctionReturns<unknown, EmptyObject>> {
	const authDoc = await GetArcAuthGuaranteed(userID, "api/arc-ddr", logger);

	return {
		iterable: TraverseKaiAPI(
			ServerConfig.ARC_API_URL,
			// DDR Ace.
			`/api/v1/ddr/16/player_bests?profile_id=${authDoc.accountID}`,
			ServerConfig.ARC_AUTH_TOKEN,
			logger,
			null,
			fetch
		),
		context: {},
		classHandler: null,
		game: "ddr",
	};
}
