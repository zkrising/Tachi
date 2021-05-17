import { ConverterFunction, EmptyObject } from "../../../../types";
import { InvalidScoreFailure } from "../../../framework/common/converter-failures";
import { S3Score } from "./types";

function ParseDifficulty(diff: string | number) {
    switch (diff) {
        case "L7":
            return { playtype: "SP", difficulty: "NORMAL" };
        case 7:
            return { playtype: "SP", difficulty: "NORMAL" };
        case "A7":
            return { playtype: "SP", difficulty: "NORMAL" };
        case "B":
            return { playtype: "SP", difficulty: "NORMAL" };
        case 5:

        case "L14":
            return { playtype: "SP", difficulty: "NORMAL" };
        case 14:
            return { playtype: "SP", difficulty: "NORMAL" };
        case "A14":
            return { playtype: "SP", difficulty: "NORMAL" };
        case "B14":
            return { playtype: "SP", difficulty: "NORMAL" };
        default:
            throw new InvalidScoreFailure(`Invalid difficulty ${diff}.`);
    }
}

export const ConvertFileS3: ConverterFunction<S3Score, EmptyObject> = async (
    data,
    context,
    importType,
    logger
) => {};
