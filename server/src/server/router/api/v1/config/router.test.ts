import { ServerConfig } from "lib/setup/config";
import t from "tap";
import mockApi from "test-utils/mock-api";

t.test("GET /api/v1/config/beatoraja-queue-size", async (t) => {
	const res = await mockApi.get("/api/v1/config/beatoraja-queue-size");

	t.equal(
		res.body.body,
		ServerConfig.BEATORAJA_QUEUE_SIZE,
		"Should return integer equal to BEATORAJA_QUEUE_SIZE."
	);

	t.end();
});

t.test("GET /api/v1/config/usc-queue-size", async (t) => {
	const res = await mockApi.get("/api/v1/config/usc-queue-size");

	t.equal(
		res.body.body,
		ServerConfig.USC_QUEUE_SIZE,
		"Should return integer equal to USC_QUEUE_SIZE."
	);

	t.end();
});
