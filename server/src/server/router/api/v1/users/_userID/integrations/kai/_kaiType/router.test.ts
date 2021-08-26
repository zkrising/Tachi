import db from "external/mongo/db";
import t from "tap";
import { CloseAllConnections } from "test-utils/close-connections";
import { CreateFakeAuthCookie } from "test-utils/fake-auth";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";

t.test("GET /api/v1/users/:userID/integrations/kai/:kaiType", async (t) => {
	t.beforeEach(ResetDBState);

	const cookie = await CreateFakeAuthCookie(mockApi);

	t.test("Should return false if unauthed with this kaiType", async (t) => {
		const res = await mockApi.get("/api/v1/users/1/integrations/kai/flo").set("Cookie", cookie);

		t.equal(res.statusCode, 200);
		t.equal(res.body.body.authStatus, false);

		t.end();
	});

	t.test("Should return true if authed with this kaiType", async (t) => {
		await db["kai-auth-tokens"].insert({
			refreshToken: "refresh",
			service: "FLO",
			token: "bar",
			userID: 1,
		});

		const res = await mockApi.get("/api/v1/users/1/integrations/kai/flo").set("Cookie", cookie);

		t.equal(res.statusCode, 200);
		t.equal(res.body.body.authStatus, true);

		t.end();
	});

	t.test("Should return the auth status of this user specifically.", async (t) => {
		await db["kai-auth-tokens"].insert([
			{
				refreshToken: "refresh",
				service: "EAG",
				token: "bar",
				userID: 1,
			},
			{
				refreshToken: "refresh",
				service: "FLO",
				token: "baz",
				userID: 2,
			},
		]);

		const res = await mockApi.get("/api/v1/users/1/integrations/kai/flo").set("Cookie", cookie);

		t.equal(res.statusCode, 200);
		t.equal(res.body.body.authStatus, false);

		t.end();
	});

	t.end();
});

// test is currently undoable due to issues with mocking out real Fetch calls.
t.todo("PATCH /api/v1/userse/:userID/integrations/kai/:kaiType/oauth2callback");
