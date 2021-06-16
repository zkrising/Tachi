import { KtLogger } from "../../../../logger/logger";
import nodeFetch from "../../../../../utils/fetch";
import { TraverseKaiAPI } from "../../common/api-kai/traverse-api";
import { ParserFunctionReturns } from "../../common/types";
import { EmptyObject } from "../../../../../utils/types";
import { ARC_API_URL, ARC_AUTH_TOKEN } from "../../../../setup/config";

export function ParseArcSDVX(
    arcProfileID: string,
    logger: KtLogger,
    fetch = nodeFetch
): ParserFunctionReturns<unknown, EmptyObject> {
    return {
        iterable: TraverseKaiAPI(
            ARC_API_URL,
            // VIVID WAVE.
            `/api/v1/sdvx/5/player_bests?profile_id=${arcProfileID}`,
            ARC_AUTH_TOKEN,
            logger,
            fetch
        ),
        context: {},
        classHandler: null,
        game: "sdvx",
    };
}
