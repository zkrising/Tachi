import { ONE_MINUTE } from "lib/constants/time";
import { ChangeRootLogLevel, GetLogLevel } from "lib/logger/logger";
import { LOG_LEVEL } from "lib/setup/config";
import t from "tap";
import { CloseAllConnections } from "test-utils/close-connections";
import { CreateFakeAuthCookie } from "test-utils/fake-auth";
import mockApi from "test-utils/mock-api";

t.test("POST /api/v1/admin/change-log-level", async (t) => {
	t.beforeEach(() => {
		ChangeRootLogLevel(LOG_LEVEL);
	});

	const auth = await CreateFakeAuthCookie(mockApi);

	t.test("Should change the log level on the server.", async (t) => {
		const res = await mockApi.post("/api/v1/admin/change-log-level").set("Cookie", auth).send({
			noReset: true,
			logLevel: "crit",
		});

		t.equal(res.statusCode, 200);
		t.equal(GetLogLevel(), "crit");

		t.end();
	});

	t.test("Should reject invalid log levels", async (t) => {
		const res = await mockApi.post("/api/v1/admin/change-log-level").set("Cookie", auth).send({
			noReset: true,
			logLevel: "invalid",
		});

		t.equal(res.statusCode, 400);
		t.equal(GetLogLevel(), LOG_LEVEL);

		t.end();
	});

	t.test("Should set a timer that lasts duration minutes.", async (t) => {
		const res = await mockApi.post("/api/v1/admin/change-log-level").set("Cookie", auth).send({
			duration: 0.05,
			logLevel: "warn",
		});

		t.equal(res.statusCode, 200);
		t.equal(GetLogLevel(), "warn");

		// wait a bit
		await new Promise<void>((resolve) => setTimeout(() => resolve(), ONE_MINUTE * 0.06));

		t.equal(GetLogLevel(), LOG_LEVEL);

		t.end();
	});

	t.end();
});

t.teardown(CloseAllConnections);
