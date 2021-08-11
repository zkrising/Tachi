import { KtLogger } from "lib/logger/logger";
import nodeFetch from "utils/fetch";
import { KaiAuthDocument } from "tachi-common";
import { KaiContext } from "../types";
import { TraverseKaiAPI } from "../traverse-api";
import { ParserFunctionReturns } from "../../types";
import { ServerConfig } from "lib/setup/config";
import { KaiTypeToBaseURL } from "utils/misc";

export function ParseKaiSDVX(
	service: "FLO" | "EAG" | "MIN",
	authDoc: KaiAuthDocument,
	logger: KtLogger,
	fetch = nodeFetch
): ParserFunctionReturns<unknown, KaiContext> {
	const baseUrl = KaiTypeToBaseURL(service);

	return {
		iterable: TraverseKaiAPI(
			baseUrl,
			"/api/sdvx/v1/play_history",
			authDoc.token,
			logger,
			fetch
		),
		context: {
			service,
		},
		classHandler: null,
		game: "sdvx",
	};
}
