import t from "tap";
import { FormatVersion } from "../../../../lib/constants/version";
import { CloseAllConnections } from "../../../../test-utils/close-connections";
import { CreateFakeAuthCookie } from "../../../../test-utils/fake-session";
import mockApi from "../../../../test-utils/mock-api";
import { ClearTestingRateLimitCache } from "../../../middleware/rate-limiter";

t.beforeEach(ClearTestingRateLimitCache);

// just a rudimentary test for rate-limiting. We fire 150 requests at GET /api/v1
// (which does a server status check)
// and then check any of them return 429.
t.test("Rate Limiting Test", async (t) => {
    const promises = [];

    for (let i = 0; i < 150; i++) {
        promises.push(mockApi.get("/api/v1"));
    }

    const res = await Promise.all(promises);

    const rateLimited = res.filter((e) => e.statusCode === 429);

    t.ok(rateLimited.length > 0, "Some requests should be rate limited.");

    t.end();
});

t.test("GET /api/v1", async (t) => {
    const cookie = await CreateFakeAuthCookie(mockApi);

    t.test("Should return the current time and the server version.", async (t) => {
        const res = await mockApi.get("/api/v1").set("Cookie", cookie);

        t.equal(res.statusCode, 200);
        t.equal(res.body.success, true);
        t.ok(
            Math.abs(Date.now() - res.body.body.serverTime) < 5_000,
            "Should be roughly the current time (5 seconds lenience)"
        );
        t.equal(res.body.body.version, FormatVersion());

        t.end();
    });

    t.end();
});
t.teardown(CloseAllConnections);
