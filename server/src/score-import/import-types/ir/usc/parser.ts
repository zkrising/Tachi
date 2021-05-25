import { KtLogger } from "../../../../types";
import { ChartDocument } from "kamaitachi-common";
import p, { PrudenceSchema } from "prudence";
import { InvalidScoreFailure } from "../../../framework/common/converter-failures";
import { FormatPrError } from "../../../../common/prudence";
import { USCClientScore } from "../../../../server/router/ir/usc/common";
import { IRUSCContext } from "./types";
import { ConverterIRUSC } from "./converter";
import { ParserFunctionReturnsSync } from "../../common/types";

const PR_USCIRScore: PrudenceSchema = {
    score: p.isBoundedInteger(0, 10_000_000),
    gauge: p.isBetween(0, 100),
    timestamp: p.isPositiveInteger,
    crit: p.isPositiveInteger,
    near: p.isPositiveInteger,
    error: p.isPositiveInteger,
    options: {
        gaugeType: p.isIn(0, 1),
        mirror: "boolean",
        random: "boolean",
        autoFlags: p.isInteger,
    },
};

export function ParseIRUSC(
    body: Record<string, unknown>,
    chart: ChartDocument<"usc:Single">,
    logger: KtLogger
): ParserFunctionReturnsSync<USCClientScore, IRUSCContext> {
    const err = p(
        body.score,
        PR_USCIRScore,
        {},
        { throwOnNonObject: false, allowExcessKeys: true }
    );

    if (err) {
        throw new InvalidScoreFailure(FormatPrError(err, "Invalid USC Score."));
    }

    return {
        context: {
            chart,
        },
        game: "usc",
        iterable: [body.score] as USCClientScore[],
        classHandler: null,
        ConverterFunction: ConverterIRUSC,
    };
}
