import { KtLogger } from "lib/logger/logger";
import nodeFetch from "utils/fetch";
import { KaiAuthDocument } from "tachi-common";
import { KaiContext } from "../types";
import { TraverseKaiAPI } from "../traverse-api";
import { ParserFunctionReturns } from "../../types";
import { ServerConfig } from "lib/setup/config";

export function ParseKaiIIDX(
	service: "FLO" | "EAG",
	authDoc: KaiAuthDocument,
	logger: KtLogger,
	fetch = nodeFetch
): ParserFunctionReturns<unknown, KaiContext> {
	const baseUrl = service === "FLO" ? ServerConfig.FLO_API_URL : ServerConfig.EAG_API_URL;

	return {
		iterable: TraverseKaiAPI(
			baseUrl,
			"/api/iidx/v2/play_history",
			authDoc.token,
			logger,
			fetch
		),
		context: {
			service,
		},
		classHandler: null,
		game: "iidx",
	};
}
