import t from "tap";
import { GetClientFromID, RequireOwnershipOfClient } from "./middleware";
import expMiddlewareMock from "express-request-mock";
import ResetDBState from "test-utils/resets";
import { SYMBOL_TachiData } from "lib/constants/tachi";

t.test("#GetClientFromID", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should assign the client to req[@@TachiData] if exists.", async (t) => {
		const { req } = await expMiddlewareMock(GetClientFromID, {
			params: {
				clientID: "OAUTH2_CLIENT_ID",
			},
		});

		t.strictSame(
			req[SYMBOL_TachiData]?.oauth2ClientDoc,
			{
				clientID: "OAUTH2_CLIENT_ID",
				// clientSecret: "OAUTH2_CLIENT_SECRET",
				name: "Test_Service",
				author: 1,
				requestedPermissions: ["customise_profile"],
				redirectUri: "https://example.com/callback",
			},
			"Should assign clientDoc with secret ommitted."
		);

		t.end();
	});

	t.test("Should return 404 if client does not exist.", async (t) => {
		const { res } = await expMiddlewareMock(GetClientFromID, {
			params: {
				clientID: "NONSENSE",
			},
		});

		t.equal(res.statusCode, 404);

		t.hasStrict(res._getJSONData(), {
			success: false,
			description: "This client does not exist.",
		});

		t.end();
	});

	t.end();
});

t.test("#RequireOwnershipOfClient", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should return 401 if the user has no authentication.", async (t) => {
		const { res } = await expMiddlewareMock(RequireOwnershipOfClient, {
			body: {
				__terribleHackOauth2ClientDoc: {
					author: 1,
				},
			},
			session: {},
		});

		t.equal(res.statusCode, 401);

		t.end();
	});

	t.test("Should return 403 if the user does not own this client.", async (t) => {
		const { res } = await expMiddlewareMock(RequireOwnershipOfClient, {
			body: {
				__terribleHackOauth2ClientDoc: {
					author: 1,
				},
			},
			session: {
				tachi: {
					user: {
						id: 2,
					},
				},
			},
		});

		t.equal(res.statusCode, 403);

		t.end();
	});

	t.test("Should continue if this is their session.", async (t) => {
		const { res } = await expMiddlewareMock(RequireOwnershipOfClient, {
			body: {
				__terribleHackOauth2ClientDoc: {
					author: 1,
				},
			},
			session: {
				tachi: {
					user: {
						id: 1,
					},
				},
			},
		});

		t.equal(res.statusCode, 200);

		t.end();
	});

	t.end();
});
