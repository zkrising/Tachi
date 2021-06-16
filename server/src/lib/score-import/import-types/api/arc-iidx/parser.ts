import { KtLogger } from "../../../../logger/logger";
import nodeFetch from "../../../../../utils/fetch";
import { TraverseKaiAPI } from "../../common/api-kai/traverse-api";
import { ParserFunctionReturns } from "../../common/types";
import { EmptyObject } from "../../../../../utils/types";
import { ARC_API_URL, ARC_AUTH_TOKEN } from "../../../../setup/config";
import { CreateArcIIDXClassHandler } from "./class-handler";

export async function ParseArcIIDX(
    arcProfileID: string,
    logger: KtLogger,
    fetch = nodeFetch
): Promise<ParserFunctionReturns<unknown, EmptyObject>> {
    return {
        iterable: TraverseKaiAPI(
            ARC_API_URL,
            // HEROIC VERSE
            `/api/v1/iidx/27/player_bests?profile_id=${arcProfileID}`,
            ARC_AUTH_TOKEN,
            logger,
            fetch
        ),
        context: {},
        classHandler: await CreateArcIIDXClassHandler(arcProfileID, ARC_AUTH_TOKEN),
        game: "iidx",
    };
}
