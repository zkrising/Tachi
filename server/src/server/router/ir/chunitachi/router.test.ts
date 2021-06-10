import t from "tap";
import db from "../../../../external/mongo/db";
import { CloseAllConnections } from "../../../../test-utils/close-connections";
import { InsertFakeTokenWithAllPerms } from "../../../../test-utils/fake-auth";
import mockApi from "../../../../test-utils/mock-api";
import ResetDBState from "../../../../test-utils/resets";
import { GetKTDataJSON } from "../../../../test-utils/test-data";
import deepmerge from "deepmerge";

t.test("POST /ir/chunitachi/import", (t) => {
    t.beforeEach(ResetDBState);
    t.beforeEach(InsertFakeTokenWithAllPerms("mock_token"));

    const chunitachiBody = GetKTDataJSON("./batch-manual/chunitachi.json");

    t.test("Should work for CHUNITACHI requests", async (t) => {
        const res = await mockApi
            .post("/ir/chunitachi/import")
            .set("Authorization", `Bearer mock_token`)
            .send(chunitachiBody);

        t.equal(res.body.success, true, "Should be successful");

        t.equal(res.body.body.errors.length, 0, "Should have 0 failed scores.");

        const scoreCount = await db.scores.count({ service: "Chunitachi" });

        t.equal(scoreCount, 1, "Should import one score.");

        t.end();
    });

    t.test("Should reject invalid batch-manual", async (t) => {
        const res = await mockApi
            .post("/ir/chunitachi/import")
            .set("Authorization", `Bearer mock_token`)
            .send({});

        t.equal(res.body.success, false, "Should not be successful");

        t.end();
    });

    t.test("Should reject batch-manual requests if game is not chunithm", async (t) => {
        const res = await mockApi
            .post("/ir/chunitachi/import")
            .set("Authorization", `Bearer mock_token`)
            .send(deepmerge(chunitachiBody, { head: { game: "iidx" } }));

        t.equal(res.body.success, false, "Should not be successful");

        t.end();
    });

    t.test("Should reject batch-manual requests if service is not Chunitachi", async (t) => {
        const res = await mockApi
            .post("/ir/chunitachi/import")
            .set("Authorization", `Bearer mock_token`)
            .send(deepmerge(chunitachiBody, { head: { service: "foo bar" } }));

        t.equal(res.body.success, false, "Should not be successful");

        t.end();
    });

    t.end();
});

t.teardown(CloseAllConnections);
