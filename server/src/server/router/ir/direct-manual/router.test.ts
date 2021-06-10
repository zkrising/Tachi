import t from "tap";
import db from "../../../../external/mongo/db";
import { RequireNeutralAuthentication } from "../../../../test-utils/api-common";
import { CloseAllConnections } from "../../../../test-utils/close-connections";
import { CreateFakeAuthCookie } from "../../../../test-utils/fake-auth";
import mockApi from "../../../../test-utils/mock-api";
import ResetDBState from "../../../../test-utils/resets";
import { GetKTDataJSON } from "../../../../test-utils/test-data";

t.test("POST /ir/direct-manual/import", async (t) => {
    const cookie = await CreateFakeAuthCookie(mockApi);

    t.beforeEach(ResetDBState);

    RequireNeutralAuthentication("/ir/direct-manual/import", "POST");

    t.test("Should upload BATCH-MANUAL data from the request body.", async (t) => {
        const res = await mockApi
            .post("/ir/direct-manual/import")
            .set("Cookie", cookie)
            .send(GetKTDataJSON("./batch-manual/small-file.json"));

        t.equal(res.body.success, true, "Should be successful");

        t.equal(res.body.body.errors.length, 0, "Should have 0 failed scores.");

        const scoreCount = await db.scores.count({ service: "foobar (DIRECT-MANUAL)" });

        t.equal(scoreCount, 1, "Should import one score.");

        t.end();
    });

    t.test("Should reject invalid BATCH-MANUAL data from the request body.", async (t) => {
        const res = await mockApi.post("/ir/direct-manual/import").set("Cookie", cookie).send({});

        t.equal(res.body.success, false, "Should not be successful");

        t.end();
    });

    t.end();
});

t.teardown(CloseAllConnections);
