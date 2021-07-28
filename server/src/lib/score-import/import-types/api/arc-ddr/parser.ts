import { KtLogger } from "lib/logger/logger";
import nodeFetch from "utils/fetch";
import { TraverseKaiAPI } from "../../common/api-kai/traverse-api";
import { ParserFunctionReturns } from "../../common/types";
import { EmptyObject } from "utils/types";
import { ARC_API_URL, ARC_AUTH_TOKEN } from "lib/setup/config";

export function ParseArcDDR(
	arcProfileID: string,
	logger: KtLogger,
	fetch = nodeFetch
): ParserFunctionReturns<unknown, EmptyObject> {
	return {
		iterable: TraverseKaiAPI(
			ARC_API_URL,
			// DDR Ace.
			`/api/v1/ddr/16/player_bests?profile_id=${arcProfileID}`,
			ARC_AUTH_TOKEN,
			logger,
			fetch
		),
		context: {},
		classHandler: null,
		game: "ddr",
	};
}
