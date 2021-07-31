import { KtLogger } from "lib/logger/logger";
import nodeFetch from "utils/fetch";
import { TraverseKaiAPI } from "../../common/api-kai/traverse-api";
import { ParserFunctionReturns } from "../../common/types";
import { EmptyObject } from "utils/types";
import { ServerConfig } from "lib/setup/config";

export function ParseArcSDVX(
	arcProfileID: string,
	logger: KtLogger,
	fetch = nodeFetch
): ParserFunctionReturns<unknown, EmptyObject> {
	return {
		iterable: TraverseKaiAPI(
			ServerConfig.ARC_API_URL,
			// VIVID WAVE.
			`/api/v1/sdvx/5/player_bests?profile_id=${arcProfileID}`,
			ServerConfig.ARC_AUTH_TOKEN,
			logger,
			fetch
		),
		context: {},
		classHandler: null,
		game: "sdvx",
	};
}
