import { SetRequestPermissions } from "./auth";
import db from "external/mongo/db";
import { SYMBOL_TACHI_API_AUTH } from "lib/constants/tachi";
import { ALL_PERMISSIONS } from "tachi-common";
import t from "tap";
import mockApi from "test-utils/mock-api";
import { expressRequestMock } from "test-utils/mock-request";
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
			fromAPIClient: null,
		});

		const { req } = await expressRequestMock(SetRequestPermissions, {
			headers: {
				authorization: "Bearer mock_token",
			},
		});

		t.strictSame(req[SYMBOL_TACHI_API_AUTH], {
			userID: 1,
			identifier: "Mock API Token",
			permissions: {
				customise_profile: true,
			},
			token: "mock_token",
			fromAPIClient: null,
		});

		t.end();
	});

	t.test("Should assign guest APIKey information if no auth present", async (t) => {
		const { req } = await expressRequestMock(SetRequestPermissions);

		t.strictSame(req[SYMBOL_TACHI_API_AUTH], {
			userID: null,
			identifier: "Guest Token",
			permissions: {},
			token: null,
			fromAPIClient: null,
		});

		t.end();
	});

	t.test("Should return 400 if auth type is not Bearer", async (t) => {
		const { res } = await expressRequestMock(SetRequestPermissions, {
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
		const { res } = await expressRequestMock(SetRequestPermissions, {
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
		const { res } = await expressRequestMock(SetRequestPermissions, {
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
		const { req } = await expressRequestMock(SetRequestPermissions, {
			session: {
				tachi: {
					user: await db.users.findOne({ id: 1 }),
					settings: await db["user-settings"].findOne({ userID: 1 }),
				},
			},
		});

		t.strictSame(req[SYMBOL_TACHI_API_AUTH], {
			userID: 1,
			identifier: `Session-Key 1`,
			token: null,
			permissions: ALL_PERMISSIONS,
			fromAPIClient: null,
		});
		t.end();
	});

	t.end();
});

t.test("#RejectIfBanned", (t) => {
	t.test("Should stop banned users from doing anything.", async (t) => {
		await db.users.update({ id: 1 }, { $set: { authLevel: 0 } });

		await db["api-tokens"].insert({
			userID: 1,
			identifier: "Mock API Token",
			permissions: {
				customise_profile: true,
			},
			token: "mock_token",
			fromAPIClient: null,
		});

		const res = await mockApi.get("/api/v1/status").set("Authorization", "Bearer mock_token");

		t.equal(res.statusCode, 403, "Should return 403 on benign endpoints.");

		t.end();
	});

	t.end();
});
