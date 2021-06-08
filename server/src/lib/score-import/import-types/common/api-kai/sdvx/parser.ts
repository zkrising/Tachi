import { KtLogger } from "../../../../../logger/logger";
import nodeFetch from "../../../../../../utils/fetch";
import { KaiAuthDocument } from "tachi-common";
import { KaiContext } from "../types";
import { TraverseKaiAPI } from "../traverse-api";
import { ParserFunctionReturnsAsync } from "../../types";
import { EAG_API_URL, FLO_API_URL } from "../../../../../setup/config";

export function ParseKaiSDVX(
    service: "FLO" | "EAG",
    authDoc: KaiAuthDocument,
    logger: KtLogger,
    fetch = nodeFetch
): ParserFunctionReturnsAsync<unknown, KaiContext> {
    const baseUrl = service === "FLO" ? FLO_API_URL : EAG_API_URL;

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
