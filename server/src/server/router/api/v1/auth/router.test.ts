import t from "tap";
import db from "../../../../../external/mongo/db";
import { CloseAllConnections } from "../../../../../test-utils/close-connections";
import mockApi from "../../../../../test-utils/mock-api";
import ResetDBState from "../../../../../test-utils/reset-db-state";

t.test("POST /api/v1/login", (t) => {
    t.beforeEach(ResetDBState);

    t.test("Should log a user in with right credentials", async (t) => {
        const res = await mockApi.post("/api/v1/login").send({
            username: "test_zkldi",
            password: "password",
            captcha: "foo",
        });

        t.equal(res.status, 200);
        t.equal(res.body.success, true);
        t.strictSame(res.body.body, {
            userID: 1,
        });

        t.end();
    });

    t.end();
});

t.teardown(CloseAllConnections);
