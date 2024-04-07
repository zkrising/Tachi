import { ServerConfig, TachiConfig } from "lib/setup/config";
import t from "tap";
import mockApi from "test-utils/mock-api";

t.test("GET /api/v1/config", async (t) => {
	const res = await mockApi.get("/api/v1/config");

	t.strictSame(res.body.body, TachiConfig, "Should return TachiConfig info");

	t.end();
});

t.test("GET /api/v1/config/beatoraja-queue-size", async (t) => {
	const res = await mockApi.get("/api/v1/config/beatoraja-queue-size");

	t.equal(
		res.body.body,
		ServerConfig.BEATORAJA_QUEUE_SIZE,
		"Should return integer equal to BEATORAJA_QUEUE_SIZE."
	);

	t.end();
});

t.test("GET /api/v1/config/max-rivals", async (t) => {
	const res = await mockApi.get("/api/v1/config/max-rivals");

	t.equal(res.body.body, ServerConfig.MAX_RIVALS, "Should return integer equal to MAX_RIVALS.");

	t.end();
});
