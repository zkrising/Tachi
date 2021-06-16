import t from "tap";
import { CloseAllConnections } from "../../../../../../../../../test-utils/close-connections";
import mockApi from "../../../../../../../../../test-utils/mock-api";
import ResetDBState from "../../../../../../../../../test-utils/resets";

t.test("GET /api/v1/users/:userID/games/:game/:playtype/", (t) => {
    t.beforeEach(ResetDBState);

    t.test("Should return a users statistics for that game.", async (t) => {
        const res = await mockApi.get("/api/v1/users/zkldi/games/iidx/SP");

        t.strictSame(res.body, {});

        t.end();
    });

    t.end();
});

t.teardown(CloseAllConnections);
