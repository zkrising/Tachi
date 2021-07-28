import t from "tap";
import { CloseAllConnections } from "test-utils/close-connections";
import mockApi from "test-utils/mock-api";
import { ClearTestingRateLimitCache } from "server/middleware/rate-limiter";

t.beforeEach(ClearTestingRateLimitCache);

// just a rudimentary test for rate-limiting. We fire 150 requests at GET /api/v1
// (which does a server status check)
// and then check any of them return 429.
t.test("Rate Limiting Test", async (t) => {
	const promises = [];

	for (let i = 0; i < 150; i++) {
		promises.push(mockApi.get("/api/v1/status"));
	}

	const res = await Promise.all(promises);

	const rateLimited = res.filter((e) => e.statusCode === 429);

	t.ok(rateLimited.length > 0, "Some requests should be rate limited.");

	t.end();
});

t.test("404 Handler", async (t) => {
	const res = await mockApi.get("/api/v1/invalid_route_that_will_never_exist");

	t.equal(res.statusCode, 404);
	t.strictSame(res.body, {
		success: false,
		description: "Endpoint Not Found.",
	});

	t.end();
});

t.teardown(CloseAllConnections);
