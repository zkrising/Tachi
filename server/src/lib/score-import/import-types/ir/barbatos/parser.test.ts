import t from "tap";
import { CloseAllConnections } from "../../../../../test-utils/close-connections";
import ResetDBState from "../../../../../test-utils/reset-db-state";
import { barbScore } from "../../../../../test-utils/test-data";
import CreateLogCtx from "../../../../logger/logger";
import { ParseBarbatosSingle } from "./parser";

const logger = CreateLogCtx(__filename);

t.test("#ParseBarbatosSingle", (t) => {
    t.beforeEach(ResetDBState);

    t.test("Should return the score as a payload", (t) => {
        const res = ParseBarbatosSingle((barbScore as unknown) as Record<string, unknown>, logger);

        t.hasStrict(res, {
            game: "sdvx",
            context: {},
            iterable: [barbScore],
        } as any);

        t.end();
    });

    t.test("Should reject invalid scores", (t) => {
        t.throws(() => ParseBarbatosSingle({}, logger), {
            message: "Invalid Barbatos Request",
        } as any);

        t.end();
    });

    t.end();
});

t.teardown(CloseAllConnections);
