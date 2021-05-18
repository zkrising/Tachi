import { UserGameStats } from "kamaitachi-common";
import t from "tap";
import { CloseMongoConnection } from "../../../db/db";
import CreateLogCtx from "../../../logger";
import ResetDBState from "../../../test-utils/reset-db-state";
import { CalculateClassDeltas, UpdateUGSClasses } from "./classes";

const logger = CreateLogCtx("classes.test.ts");

t.test("#UpdateUGSClasses", (t) => {
    t.test("Should produce an empty object by default", async (t) => {
        const res = await UpdateUGSClasses("iidx", "SP", 1, {}, null, logger);

        t.strictSame(res, {});

        t.end();
    });

    t.test("Should call and merge the ClassHandler", async (t) => {
        const res = await UpdateUGSClasses("iidx", "SP", 1, {}, () => ({ foo: "bar" }), logger);

        t.strictSame(res, { foo: "bar" });

        t.end();
    });

    t.test("Should call static handlers if there is one", async (t) => {
        const res = await UpdateUGSClasses(
            "gitadora",
            "Dora",
            1,
            {
                skill: 9000,
            },
            null,
            logger
        );

        t.strictSame(res, { skillColour: "rainbow" });

        t.end();
    });

    t.end();
});

t.test("#CalculateClassDeltas", (t) => {
    t.beforeEach(ResetDBState);

    t.test("Should return improved classes from null", (t) => {
        const res = CalculateClassDeltas("iidx", "SP", { dan: "kaiden" }, null, logger);

        t.strictSame(res, [
            {
                set: "dan",
                playtype: "SP",
                old: null,
                new: "kaiden",
            },
        ]);

        t.end();
    });

    t.test("Should return improved classes from null class", (t) => {
        const res = CalculateClassDeltas(
            "iidx",
            "SP",
            { dan: "kaiden" },
            { classes: {} } as UserGameStats,
            logger
        );

        t.strictSame(res, [
            {
                set: "dan",
                playtype: "SP",
                old: null,
                new: "kaiden",
            },
        ]);

        t.end();
    });

    t.test("Should return improved classes", (t) => {
        const res = CalculateClassDeltas(
            "iidx",
            "SP",
            { dan: "kaiden" },
            ({ classes: { dan: "chuuden" } } as unknown) as UserGameStats,
            logger
        );

        t.strictSame(res, [
            {
                set: "dan",
                playtype: "SP",
                old: "chuuden",
                new: "kaiden",
            },
        ]);

        t.end();
    });

    t.test("Should not return identical classes", (t) => {
        const res = CalculateClassDeltas(
            "iidx",
            "SP",
            { dan: "kaiden" },
            ({ classes: { dan: "kaiden" } } as unknown) as UserGameStats,
            logger
        );

        t.strictSame(res, []);

        t.end();
    });

    t.test("Should not return worse classes", (t) => {
        const res = CalculateClassDeltas(
            "iidx",
            "SP",
            { dan: "10" },
            ({ classes: { dan: "kaiden" } } as unknown) as UserGameStats,
            logger
        );

        t.strictSame(res, []);

        t.end();
    });

    t.end();
});

t.teardown(CloseMongoConnection);
