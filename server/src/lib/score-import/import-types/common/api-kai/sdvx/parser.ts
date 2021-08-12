import { KtLogger } from "lib/logger/logger";
import nodeFetch from "utils/fetch";
import { KaiAuthDocument } from "tachi-common";
import { KaiContext } from "../types";
import { TraverseKaiAPI } from "../traverse-api";
import { ParserFunctionReturns } from "../../types";
import { KaiTypeToBaseURL } from "../utils";
import { CreateKaiSDVXClassHandler } from "./class-handler";
import { CreateKaiReauthFunction } from "../reauth";

export async function ParseKaiSDVX(
	service: "FLO" | "EAG" | "MIN",
	authDoc: KaiAuthDocument,
	logger: KtLogger,
	fetch = nodeFetch
): Promise<ParserFunctionReturns<unknown, KaiContext>> {
	const baseUrl = KaiTypeToBaseURL(service);

	return {
		iterable: TraverseKaiAPI(
			baseUrl,
			"/api/sdvx/v1/play_history",
			authDoc.token,
			logger,
			CreateKaiReauthFunction(service, authDoc, logger, fetch),
			fetch
		),
		context: {
			service,
		},
		classHandler: await CreateKaiSDVXClassHandler(service, authDoc.token, fetch),
		game: "sdvx",
	};
}
