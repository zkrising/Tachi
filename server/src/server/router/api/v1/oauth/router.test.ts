import db from "external/mongo/db";
import t from "tap";
import mockApi from "test-utils/mock-api";
import ResetDBState from "test-utils/resets";

t.test("POST /api/v1/oauth/token", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should grant and create an api token.", async (t) => {
		const res = await mockApi.post(`/api/v1/oauth/token`).send({
			client_id: "OAUTH2_CLIENT_ID",
			client_secret: "OAUTH2_CLIENT_SECRET",
			grant_type: "authorization_code",
			redirect_uri: "https://example.com/callback",
			code: "AUTH_CODE",
		});

		t.equal(res.statusCode, 200);

		const tokenDoc = await db["api-tokens"].findOne({
			token: res.body.body.token,
		});

		t.not(tokenDoc, null);
		t.equal(tokenDoc?.userID, 1);
		t.equal(tokenDoc?.fromOAuth2Client, "OAUTH2_CLIENT_ID");
		t.strictSame(
			tokenDoc?.permissions,
			{
				customise_profile: true,
			},
			"Should assign the permissions this client has configured."
		);

		t.end();
	});

	t.test("Requires a valid code.", async (t) => {
		const res = await mockApi.post(`/api/v1/oauth/token`).send({
			client_id: "OAUTH2_CLIENT_ID",
			client_secret: "OAUTH2_CLIENT_SECRET",
			grant_type: "authorization_code",
			redirect_uri: "https://example.com/callback",
			code: "invalidcode",
		});

		t.equal(res.statusCode, 404);

		t.end();
	});

	t.test("Requires a valid clientID.", async (t) => {
		const res = await mockApi.post(`/api/v1/oauth/token`).send({
			client_id: "INVALID_CLIENT_ID",
			client_secret: "OAUTH2_CLIENT_SECRET",
			grant_type: "authorization_code",
			redirect_uri: "https://example.com/callback",
			code: "AUTH_CODE",
		});

		t.equal(res.statusCode, 404);

		t.end();
	});

	t.test("Requires a valid client secret.", async (t) => {
		const res = await mockApi.post(`/api/v1/oauth/token`).send({
			client_id: "OAUTH2_CLIENT_ID",
			client_secret: "INVALID_SECRET",
			grant_type: "authorization_code",
			redirect_uri: "https://example.com/callback",
			code: "AUTH_CODE",
		});

		t.equal(res.statusCode, 403);

		t.end();
	});

	t.test("Requires an identical redirect_uri.", async (t) => {
		const res = await mockApi.post(`/api/v1/oauth/token`).send({
			client_id: "OAUTH2_CLIENT_ID",
			client_secret: "OAUTH2_CLIENT_SECRET",
			grant_type: "authorization_code",
			redirect_uri: "https://invalid.example.com/callback",
			code: "AUTH_CODE",
		});

		t.equal(res.statusCode, 400);

		t.end();
	});

	t.end();
});
