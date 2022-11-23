import { GetClientFromID, RequireOwnershipOfClient } from "./middleware";
import { SYMBOL_TACHI_DATA } from "lib/constants/tachi";
import t from "tap";
import { expressRequestMock } from "test-utils/mock-request";
import ResetDBState from "test-utils/resets";

t.test("#GetClientFromID", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should assign the client to req[@@TachiData] if exists.", async (t) => {
		const { req } = await expressRequestMock(GetClientFromID, {
			params: {
				clientID: "OAUTH2_CLIENT_ID",
			},
			[SYMBOL_TACHI_DATA]: {},
		});

		t.strictSame(
			req[SYMBOL_TACHI_DATA]?.apiClientDoc,
			{
				clientID: "OAUTH2_CLIENT_ID",

				// clientSecret: "OAUTH2_CLIENT_SECRET",
				name: "Test_Service",
				author: 1,
				requestedPermissions: ["customise_profile"],
				redirectUri: "https://example.com/callback",
				webhookUri: null,
				apiKeyTemplate: null,
				apiKeyFilename: null,
			},
			"Should assign clientDoc with secret omitted."
		);

		t.end();
	});

	t.test("Should return 404 if client does not exist.", async (t) => {
		const { res } = await expressRequestMock(GetClientFromID, {
			params: {
				clientID: "NONSENSE",
			},
			[SYMBOL_TACHI_DATA]: {},
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
		const { res } = await expressRequestMock(RequireOwnershipOfClient, {
			safeBody: {
				__terribleHackOauth2ClientDoc: {
					author: 1,
				},
			},
			[SYMBOL_TACHI_DATA]: {},
			session: {},
		});

		t.equal(res.statusCode, 401);

		t.end();
	});

	t.test("Should return 403 if the user does not own this client.", async (t) => {
		const { res } = await expressRequestMock(RequireOwnershipOfClient, {
			safeBody: {
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
			[SYMBOL_TACHI_DATA]: {},
		});

		t.equal(res.statusCode, 403);

		t.end();
	});

	t.test("Should continue if this is their session.", async (t) => {
		const { res } = await expressRequestMock(RequireOwnershipOfClient, {
			safeBody: {
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
			[SYMBOL_TACHI_DATA]: {},
		});

		t.equal(res.statusCode, 200);

		t.end();
	});

	t.end();
});
