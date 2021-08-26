import t from "tap";
import { SetRequestPermissions, AllPermissions } from "./auth";
import expMiddlewareMock from "express-request-mock";
import db from "external/mongo/db";
import { SYMBOL_TachiAPIAuth } from "lib/constants/tachi";
import { CloseAllConnections } from "test-utils/close-connections";
import ResetDBState from "test-utils/resets";

t.test("#SetRequestPermissions", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should assign valid APIKey information to req[SYMBOL_TachiAPIData]", async (t) => {
		await db["api-tokens"].insert({
			userID: 1,
			identifier: "Mock API Token",
			permissions: {
				customise_profile: true,
			},
			token: "mock_token",
		});

		const { req } = await expMiddlewareMock(SetRequestPermissions, {
			headers: {
				authorization: "Bearer mock_token",
			},
		});

		t.strictSame(req[SYMBOL_TachiAPIAuth], {
			userID: 1,
			identifier: "Mock API Token",
			permissions: {
				customise_profile: true,
			},
			token: "mock_token",
		});

		t.end();
	});

	t.test("Should assign guest APIKey information if no auth present", async (t) => {
		const { req } = await expMiddlewareMock(SetRequestPermissions);

		t.strictSame(req[SYMBOL_TachiAPIAuth], {
			userID: null,
			identifier: "Guest Token",
			permissions: {},
			token: null,
		});

		t.end();
	});

	t.test("Should return 400 if auth type is not Bearer", async (t) => {
		const { res } = await expMiddlewareMock(SetRequestPermissions, {
			headers: {
				authorization: "Basic Foo",
			},
		});

		t.equal(res.statusCode, 400);

		const json = res._getJSONData();
		t.match(json.description, /Invalid Authorization Type - Expected Bearer/u);
		t.end();
	});

	t.test("Should return 401 if no token is present", async (t) => {
		const { res } = await expMiddlewareMock(SetRequestPermissions, {
			headers: {
				authorization: "Bearer ",
			},
		});

		t.equal(res.statusCode, 401);

		const json = res._getJSONData();
		t.match(json.description, /Invalid token/u);
		t.end();
	});

	t.test("Should return 401 if token is unknown", async (t) => {
		const { res } = await expMiddlewareMock(SetRequestPermissions, {
			headers: {
				authorization: "Bearer unknown_token",
			},
		});

		t.equal(res.statusCode, 401);

		const json = res._getJSONData();
		t.match(
			json.description,
			/The provided API token does not correspond with any key in the database/u
		);
		t.end();
	});

	t.test("Should assign a Session-Key if user authenticates with cookie.", async (t) => {
		const { req } = await expMiddlewareMock(SetRequestPermissions, {
			session: {
				tachi: {
					userID: 1,
				},
			},
		});

		t.strictSame(req[SYMBOL_TachiAPIAuth], {
			userID: 1,
			identifier: `Session-Key 1`,
			token: null,
			permissions: AllPermissions,
		});
		t.end();
	});

	t.end();
});
