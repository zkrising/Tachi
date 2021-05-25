import t from "tap";
import db from "../../../../external/mongo/db";
import { RequireNeutralAuthentication } from "../../../../test-utils/api-common";
import { CloseAllConnections } from "../../../../test-utils/close-connections";
import { CreateFakeAuthCookie } from "../../../../test-utils/fake-session";
import mockApi from "../../../../test-utils/mock-api";
import ResetDBState from "../../../../test-utils/reset-db-state";
import { GetKTDataJSON } from "../../../../test-utils/test-data";
import deepmerge from "deepmerge";

t.test("POST /api/v1/ir/chunitachi/import", async (t) => {
    t.beforeEach(ResetDBState);

    const cookie = await CreateFakeAuthCookie(mockApi);

    RequireNeutralAuthentication("/api/v1/ir/chunitachi/import", "POST");

    const chunitachiBody = GetKTDataJSON("./batch-manual/chunitachi.json");

    t.test("Should work for CHUNITACHI requests", async (t) => {
        const res = await mockApi
            .post("/api/v1/ir/chunitachi/import")
            .set("Cookie", cookie)
            .send(chunitachiBody);

        t.equal(res.body.success, true, "Should be successful");

        t.equal(res.body.body.errors.length, 0, "Should have 0 failed scores.");

        const scoreCount = await db.scores.count({ service: "Chunitachi" });

        t.equal(scoreCount, 1, "Should import one score.");

        t.end();
    });

    t.test("Should reject invalid batch-manual", async (t) => {
        const res = await mockApi
            .post("/api/v1/ir/chunitachi/import")
            .set("Cookie", cookie)
            .send({});

        t.equal(res.body.success, false, "Should not be successful");

        t.end();
    });

    t.test("Should reject batch-manual requests if game is not chunithm", async (t) => {
        const res = await mockApi
            .post("/api/v1/ir/chunitachi/import")
            .set("Cookie", cookie)
            .send(deepmerge(chunitachiBody, { head: { game: "iidx" } }));

        t.equal(res.body.success, false, "Should not be successful");

        t.end();
    });

    t.test("Should reject batch-manual requests if service is not Chunitachi", async (t) => {
        const res = await mockApi
            .post("/api/v1/ir/chunitachi/import")
            .set("Cookie", cookie)
            .send(deepmerge(chunitachiBody, { head: { service: "foo bar" } }));

        t.equal(res.body.success, false, "Should not be successful");

        t.end();
    });

    t.end();
});

t.teardown(CloseAllConnections);
