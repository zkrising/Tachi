import { KtLogger } from "lib/logger/logger";
import { ServerConfig } from "lib/setup/config";
import { integer } from "tachi-common";
import nodeFetch from "utils/fetch";
import { GetArcAuthGuaranteed } from "utils/queries/auth";
import { EmptyObject } from "utils/types";
import { TraverseKaiAPI } from "../../common/api-kai/traverse-api";
import { ParserFunctionReturns } from "../../common/types";

export async function ParseArcSDVX(
	userID: integer,
	logger: KtLogger,
	fetch = nodeFetch
): Promise<ParserFunctionReturns<unknown, EmptyObject>> {
	const authDoc = await GetArcAuthGuaranteed(userID, "api/arc-sdvx", logger);

	if (!ServerConfig.ARC_AUTH_TOKEN || !ServerConfig.ARC_API_URL) {
		throw new Error(
			`Cannot parse ArcSDVX withouth ARC_API_URL and ARC_AUTH_TOKEN being defined.`
		);
	}

	return {
		iterable: TraverseKaiAPI(
			ServerConfig.ARC_API_URL,
			// VIVID WAVE.
			// The trailing slash is critical! ARC only allows /? queries.
			`/api/v1/sdvx/5/player_bests/?profile_id=${authDoc.accountID}`,
			ServerConfig.ARC_AUTH_TOKEN,
			logger,
			null,
			fetch
		),
		context: {},
		classHandler: null,
		game: "sdvx",
	};
}
