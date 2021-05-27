import t from "tap";
import { CloseMongoConnection } from "../../../../../external/mongo/db";
import { uscChart, uscScore } from "../../../../../test-utils/test-data";
import CreateLogCtx from "../../../../logger/logger";
import { ParseIRUSC } from "./parser";

const logger = CreateLogCtx(__filename);

t.test("#ParseIRUSC", (t) => {
    t.test("Should validate and convert a score into an iterable", (t) => {
        const res = ParseIRUSC(
            ({ score: uscScore } as unknown) as Record<string, unknown>,
            uscChart,
            logger
        );

        t.hasStrict(res, {
            game: "usc",
            context: {
                chart: uscChart,
            },
            iterable: [uscScore],
        } as any);

        t.end();
    });

    t.end();
});

t.teardown(CloseMongoConnection);
