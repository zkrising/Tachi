import { KtLogger } from "../../../../../logger/logger";
import nodeFetch from "../../../../../../utils/fetch";
import { KaiAuthDocument } from "kamaitachi-common";
import { KaiContext } from "../types";
import { EAG_API_URL, FLO_API_URL } from "../../../../../../secrets";
import { ConvertAPIKaiIIDX } from "./converter";
import { TraverseKaiAPI } from "../traverse-api";
import { ParserFunctionReturnsAsync } from "../../types";

export function ParseKaiIIDX(
    service: "FLO" | "EAG",
    authDoc: KaiAuthDocument,
    logger: KtLogger,
    fetch = nodeFetch
): ParserFunctionReturnsAsync<unknown, KaiContext> {
    const baseUrl = service === "FLO" ? FLO_API_URL : EAG_API_URL;

    return {
        iterable: TraverseKaiAPI(baseUrl, "/api/iidx/v2/play_history", authDoc, logger, fetch),
        context: {
            service,
        },
        classHandler: null,
        game: "iidx",
        ConverterFunction: ConvertAPIKaiIIDX,
    };
}
