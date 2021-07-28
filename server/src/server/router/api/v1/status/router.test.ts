import { FormatVersion } from "lib/constants/version";
import { CreateFakeAuthCookie } from "test-utils/fake-auth";
import mockApi from "test-utils/mock-api";
import t from "tap";
import { CloseAllConnections } from "test-utils/close-connections";

t.test("GET /api/v1/status", async (t) => {
	const cookie = await CreateFakeAuthCookie(mockApi);

	t.test("Should return the current time and the server version.", async (t) => {
		const res = await mockApi.get("/api/v1/status").set("Cookie", cookie);

		t.equal(res.statusCode, 200);
		t.equal(res.body.success, true);
		t.ok(
			Math.abs(Date.now() - res.body.body.serverTime) < 5_000,
			"Should be roughly the current time (5 seconds lenience)"
		);
		t.equal(res.body.body.version, FormatVersion());
		t.equal(res.body.body.whoami, 1);

		t.end();
	});

	t.test("Should echo the provided echo param.", async (t) => {
		const res = await mockApi.get("/api/v1/status?echo=foobar").set("Cookie", cookie);

		t.equal(res.statusCode, 200);
		t.equal(res.body.success, true);
		t.equal(res.body.body.echo, "foobar");
		t.ok(
			Math.abs(Date.now() - res.body.body.serverTime) < 5_000,
			"Should be roughly the current time (5 seconds lenience)"
		);
		t.equal(res.body.body.version, FormatVersion());
		t.equal(res.body.body.whoami, 1);

		t.end();
	});

	t.end();
});

t.test("POST /api/v1/status", async (t) => {
	const cookie = await CreateFakeAuthCookie(mockApi);

	t.test("Should return the current time and the server version.", async (t) => {
		const res = await mockApi.post("/api/v1/status").set("Cookie", cookie);

		t.equal(res.statusCode, 200);
		t.equal(res.body.success, true);
		t.ok(
			Math.abs(Date.now() - res.body.body.serverTime) < 5_000,
			"Should be roughly the current time (5 seconds lenience)"
		);
		t.equal(res.body.body.version, FormatVersion());
		t.equal(res.body.body.whoami, 1);

		t.end();
	});

	t.test("Should echo the provided echo param.", async (t) => {
		const res = await mockApi.post("/api/v1/status").set("Cookie", cookie).send({
			echo: "foobar",
		});

		t.equal(res.statusCode, 200);
		t.equal(res.body.success, true);
		t.equal(res.body.body.echo, "foobar");
		t.ok(
			Math.abs(Date.now() - res.body.body.serverTime) < 5_000,
			"Should be roughly the current time (5 seconds lenience)"
		);
		t.equal(res.body.body.version, FormatVersion());
		t.equal(res.body.body.whoami, 1);

		t.end();
	});

	t.end();
});

t.teardown(CloseAllConnections);
